import boto3
import json

# Initialize DynamoDB resource
dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('RoomQuizzes')

def lambda_handler(event, context):
    try:
        # Parse request body
        body = event
        room_code = body.get('roomCode')
        participant_name = body.get('participantName')

        # Validate input
        if not room_code or not participant_name:
            return {
                'statusCode': 400,
                'body': json.dumps({'error': 'roomCode and participantName are required.'})
            }

        # Fetch room data
        response = table.get_item(Key={'roomCode': room_code})
        room = response.get('Item')

        if not room:
            return {
                'statusCode': 404,
                'body': json.dumps({'error': 'Room not found.'})
            }

        # Check for duplicate participant names
        participants = room.get('participants', [])
        if any(participant['name'] == participant_name for participant in participants):
            return {
                'statusCode': 400,
                'body': json.dumps({'error': 'Participant name already exists in this room.'})
            }

        # Add participant to the room
        new_participant = {'name': participant_name, 'score': 0}
        table.update_item(
            Key={'roomCode': room_code},
            UpdateExpression="SET participants = list_append(if_not_exists(participants, :empty_list), :new_participant)",
            ExpressionAttributeValues={
                ':empty_list': [],
                ':new_participant': [new_participant]
            },
            ReturnValues="UPDATED_NEW"
        )

        return {
            'statusCode': 200,
            'body': json.dumps({'message': 'Participant added successfully!', 'participant': new_participant})
        }

    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps({'error': str(e)})
        }