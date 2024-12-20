import boto3
import json
import uuid
from datetime import datetime

# Initialize DynamoDB resource
dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('RoomQuizzes')

def lambda_handler(event, context):
    try:
        # Parse request body
        print(event)

        body = event
        print(body)
        room_title = body.get('quizTitle')
        print("roomTitle")
        print(room_title)
        questions = body.get('questions')
        print('questions')
        print(questions)

        print(f'room title:{room_title}')

        # Validate input
        if not room_title or not questions:
            return {
                'statusCode': 400,
                'body': json.dumps({'error': 'roomTitle and questions are required.'})
            }

        # Generate a unique room code
        room_code = str(uuid.uuid4())[:6].upper()  # Shortened UUID for simplicity

        # Create item to store in DynamoDB
        item = {
            'roomCode': room_code,
            'roomTitle': room_title,
            'questions': questions,
            'createdAt': datetime.utcnow().isoformat(),
            'quizStarted': False
        }
        print('item')
        print(item)

        # Save to DynamoDB
        table.put_item(Item=item)

        # Return success response
        return {
            'statusCode': 200,
            'body': json.dumps({'roomCode': room_code})
        }

    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps({'error': str(e)})
        }
