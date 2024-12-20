import boto3
import os
import json

dynamodb = boto3.resource('dynamodb')
connection_table = dynamodb.Table('WebSocketConnections')
apigateway = boto3.client('apigatewaymanagementapi', endpoint_url=os.environ['WEBSOCKET_API_URL'])

def lambda_handler(event, context):
    body = json.loads(event['body'])
    room_code = body.get('roomCode')

    if not room_code:
        return {
            'statusCode': 400,
            'body': 'Missing roomCode'
        }

    try:
        # Notify all players to start the quiz
        response = connection_table.query(
            IndexName='RoomCodeIndex',
            KeyConditionExpression="roomCode = :room_code",
            ExpressionAttributeValues={":room_code": room_code}
        )
        player_connections = response['Items']

        for player in player_connections:
            apigateway.post_to_connection(
                ConnectionId=player['connectionId'],
                Data=json.dumps({'action': 'startQuiz'})
            )

        return {'statusCode': 200}
    except Exception as e:
        print(f"Error in startQuiz: {e}")
        return {
            'statusCode': 500,
            'body': 'Failed to start quiz'
        }
