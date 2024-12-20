import boto3
import json
from decimal import Decimal

# Initialize DynamoDB and Lambda client
dynamodb = boto3.resource('dynamodb')
room_table = dynamodb.Table('RoomQuizzes')  # Table storing quiz data
lambda_client = boto3.client('lambda')      # For invoking the WebSocket Lambda

# Helper function to convert Decimal to int/float
def decimal_to_int(obj):
    if isinstance(obj, Decimal):
        return int(obj)
    raise TypeError("Type not serializable")

def lambda_handler(event, context):
    try:
        # Parse the request body
        body = event
        room_code = body.get('roomCode')
        player_name = body.get('playerName')
        answers = body.get('answers')

        if not room_code or not player_name or answers is None:
            return {
                'statusCode': 400,
                'body': json.dumps({'error': 'Missing required parameters'})
            }

        # Fetch room data
        response = room_table.get_item(Key={'roomCode': room_code})
        room = response.get('Item')

        if not room or 'questions' not in room:
            return {
                'statusCode': 404,
                'body': json.dumps({'error': 'Questions not found for the room'})
            }

        # Evaluate answers
        questions = json.loads(json.dumps(room['questions'], default=decimal_to_int))
        total_score = 0

        for idx, selected_answer in enumerate(answers):
            correct_answer = questions[idx]['correctAnswer']
            if selected_answer == correct_answer:
                total_score += 1

        # Return the calculated score
        return {
            'statusCode': 200,
            'body': json.dumps({'score': total_score})
        }

    except Exception as e:
        print(f"Error in submit-answer Lambda: {e}")
        return {
            'statusCode': 500,
            'body': json.dumps({'error': str(e)})
        }
