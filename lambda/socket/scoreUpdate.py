import boto3
import os
import json

dynamodb = boto3.resource('dynamodb')
connection_table = dynamodb.Table('WebSocketConnections')
apigateway = boto3.client('apigatewaymanagementapi', endpoint_url=os.environ['WEBSOCKET_API_URL'])

def lambda_handler(event, context):
    body = json.loads(event['body'])
    room_code = body.get('roomCode')
    player_name = body.get('playerName')
    score = body.get('score')

    if not room_code or not player_name or score is None:
        return {
            'statusCode': 400,
            'body': 'Missing roomCode, playerName, or score'
        }

    try:
        # Notify the host about the score update
        response = connection_table.query(
            IndexName='RoomCodeIndex',
            KeyConditionExpression="roomCode = :room_code",
            ExpressionAttributeValues={":room_code": room_code}
        )
        host_connections = [conn for conn in response['Items'] if conn['userType'] == 'host']

        for host in host_connections:
            apigateway.post_to_connection(
                ConnectionId=host['connectionId'],
                Data=json.dumps({'action': 'scoreUpdate', 'playerName': player_name, 'score': score})
            )

        return {'statusCode': 200}
    except Exception as e:
        print(f"Error in scoreUpdate: {e}")
        return {
            'statusCode': 500,
            'body': 'Failed to update score'
        }
