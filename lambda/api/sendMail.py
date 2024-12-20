import boto3
import json

# Initialize AWS resources
sns = boto3.client('sns')

def lambda_handler(event, context):
    try:
        print("Event received:", event)

        # Extract action and data from the event
        action = event.get('action')
        room_code = event.get('roomCode')
        leaderboard = event.get('leaderboard', [])
        host_email = event.get('email')

        if action == 'sendEmail':
            if not host_email or not room_code or not leaderboard:
                return {
                    'statusCode': 400,
                    'body': json.dumps({'error': 'Missing email, room code, or leaderboard data'})
                }

            # Prepare leaderboard message
            message_body = "Leaderboard Results:\n\n" + "\n".join(
                [f"{entry['name']}: {entry['score']}" for entry in leaderboard]
            )
            print("Message Body to Send via Email:", message_body)

            # Create a new SNS topic for this specific email
            try:
                # Subscribe the email to the topic
                sns.subscribe(
                    TopicArn="arn:aws:sns:us-east-1:441880183912:quizzy",
                    Protocol='email',
                    Endpoint=host_email
                )

                # Publish the message
                sns.publish(
                    TopicArn="arn:aws:sns:us-east-1:441880183912:quizzy",
                    Subject="Quizzy Leaderboard Results",
                    Message=message_body
                )

                return {
                    'statusCode': 200,
                    'body': json.dumps({'message': 'Leaderboard results sent to email'})
                }

            except Exception as subscribe_error:
                print(f"Error in email subscription: {subscribe_error}")
                return {
                    'statusCode': 500,
                    'body': json.dumps({'error': 'Failed to send email'})
                }

        return {
            'statusCode': 400,
            'body': json.dumps({'error': 'Invalid action'})
        }

    except Exception as e:
        print(f"Error in Lambda function: {e}")
        return {
            'statusCode': 500,
            'body': json.dumps({'error': str(e)})
        }
