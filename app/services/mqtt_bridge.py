import json
import logging
import paho.mqtt.client as mqtt
from app.database.connection import SessionLocal
from app.api.shipments import ingest_iot_telemetry_endpoint
from app.models.shipment import IoTTelemetryIngest

logger = logging.getLogger(__name__)

MQTT_BROKER_HOST = "127.0.0.1"
MQTT_BROKER_PORT = 1883
MQTT_TOPIC_SUB = "telemetry/+/data"

def on_connect(client, userdata, flags, rc, properties=None):
    if rc == 0:
        logger.info(f"Connected to MQTT Broker at {MQTT_BROKER_HOST}:{MQTT_BROKER_PORT}")
        client.subscribe(MQTT_TOPIC_SUB)
        logger.info(f"Subscribed to MQTT Topic Pattern: {MQTT_TOPIC_SUB}")
    else:
        logger.error(f"Failed to connect to MQTT Broker with return code {rc}")

def on_message(client, userdata, msg):
    """
    Handles incoming MQTT IoT sensor messages.
    Topic pattern: telemetry/<tracking_id>/data
    Example payload: {"temperature": 18.5, "lat": 50.1109, "lng": 8.6821, "humidity": 55.0, "device_id": "SENS-IOT-9001"}
    """
    try:
        topic_parts = msg.topic.split('/')
        if len(topic_parts) < 3:
            return
        
        tracking_id = topic_parts[1]
        payload = json.loads(msg.payload.decode('utf-8'))
        
        db = SessionLocal()
        try:
            telemetry_data = IoTTelemetryIngest(
                temperature=payload.get("temperature", 0.0),
                lat=payload.get("lat"),
                lng=payload.get("lng"),
                humidity=payload.get("humidity"),
                battery_pct=payload.get("battery_pct"),
                device_id=payload.get("device_id")
            )
            ingest_iot_telemetry_endpoint(tracking_id=tracking_id, telemetry=telemetry_data, db=db)
            logger.info(f"Successfully processed MQTT IoT update for {tracking_id}: {telemetry_data.temperature}°C")
        finally:
            db.close()
    except Exception as exc:
        logger.error(f"Error processing MQTT message on topic {msg.topic}: {exc}")

class MQTTBridgeService:
    def __init__(self, host=MQTT_BROKER_HOST, port=MQTT_BROKER_PORT):
        self.host = host
        self.port = port
        self.client = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2, client_id="pharma_shield_mqtt_bridge")
        self.client.on_connect = on_connect
        self.client.on_message = on_message

    def start(self):
        try:
            self.client.connect(self.host, self.port, 60)
            self.client.loop_start()
            logger.info("MQTT Bridge background listener started.")
        except Exception as exc:
            logger.warning(f"Could not connect to MQTT Broker at {self.host}:{self.port} - {exc}")

    def stop(self):
        self.client.loop_stop()
        self.client.disconnect()

mqtt_bridge = MQTTBridgeService()
