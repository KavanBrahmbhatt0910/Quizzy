import boto3
import os

dynamodb = boto3.resource('dynamodb')
connection_table = dynamodb.Table('WebSocketConnections')

def lambda_handler(event, context):
    connection_id = event['requestContext']['connectionId']
    room_code = event['queryStringParameters'].get('roomCode')
    user_type = event['queryStringParameters'].get('userType', 'player')

    if not room_code:
        return {
            'statusCode': 400,
            'body': 'Missing roomCode parameter'
        }

    # Store connection details in DynamoDB
    try:
        connection_table.put_item(
            Item={
                'connectionId': connection_id,
                'roomCode': room_code,
                'userType': user_type
            }
        )
        return {'statusCode': 200}
    except Exception as e:
        print(f"Error storing connection: {e}")
        return {
            'statusCode': 500,
            'body': 'Failed to store connection'
        }
