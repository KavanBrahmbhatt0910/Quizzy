import boto3
import json
from decimal import Decimal

# Initialize DynamoDB
dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('RoomQuizzes')

# Function to convert Decimal to int or float for JSON serialization
def decimal_to_int(obj):
    if isinstance(obj, Decimal):
        return int(obj)
    raise TypeError("Type not serializable")

def lambda_handler(event, context):
    try:
        body = event
        room_code = body.get('roomCode')

        if not room_code:
            return {
                'statusCode': 400,
                'body': json.dumps({'error': 'Missing roomCode'})
            }

        # Fetch the room data and all questions
        response = table.get_item(Key={'roomCode': room_code})
        room = response.get('Item')

        if not room or 'questions' not in room:
            return {
                'statusCode': 404,
                'body': json.dumps({'error': 'Questions not found.'})
            }

        # Convert Decimal values to int or float
        questions = room['questions']
        questions = json.loads(json.dumps(questions, default=decimal_to_int))

        return {
            'statusCode': 200,
            'body': json.dumps({'questions': questions})
        }

    except Exception as e:
        print(f"Error: {e}")
        return {
            'statusCode': 500,
            'body': json.dumps({'error': str(e)})
        }
