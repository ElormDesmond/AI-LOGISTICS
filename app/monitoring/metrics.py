import time
from fastapi import Request, Response
from prometheus_client import Counter, Histogram, generate_latest, CONTENT_TYPE_LATEST

# Prometheus Metrics Definitions
api_requests_total = Counter(
    'api_requests_total',
    'Total HTTP API requests processed',
    ['method', 'endpoint', 'status_code']
)

api_request_duration_seconds = Histogram(
    'api_request_duration_seconds',
    'HTTP API request latency in seconds',
    ['method', 'endpoint']
)

agent_decisions_total = Counter(
    'agent_decisions_total',
    'Total agent decisions and risk assessments generated',
    ['agent_type', 'decision_type']
)

agent_decision_cost_usd = Histogram(
    'agent_decision_cost_usd',
    'Estimated cost of executed agent recommendations in USD',
    ['action_type']
)

async def prometheus_monitoring_middleware(request: Request, call_next):
    """
    Middleware tracking request duration and count for Prometheus metrics.
    """
    start_time = time.time()
    response = await call_next(request)
    duration = time.time() - start_time

    endpoint = request.url.path
    api_requests_total.labels(
        method=request.method,
        endpoint=endpoint,
        status_code=response.status_code
    ).inc()

    api_request_duration_seconds.labels(
        method=request.method,
        endpoint=endpoint
    ).observe(duration)

    return response

def get_prometheus_metrics_response() -> Response:
    """Returns raw Prometheus metrics text formatted for scraping."""
    return Response(content=generate_latest(), media_type=CONTENT_TYPE_LATEST)
