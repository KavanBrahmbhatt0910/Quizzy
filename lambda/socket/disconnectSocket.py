import boto3
import os

dynamodb = boto3.resource('dynamodb')
connection_table = dynamodb.Table('WebSocketConnections')

def lambda_handler(event, context):
    connection_id = event['requestContext']['connectionId']

    try:
        # Remove the connection from DynamoDB
        connection_table.delete_item(
            Key={'connectionId': connection_id}
        )
        return {'statusCode': 200}
    except Exception as e:
        print(f"Error removing connection: {e}")
        return {
            'statusCode': 500,
            'body': 'Failed to remove connection'
        }
