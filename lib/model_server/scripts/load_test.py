import time
import argparse
import pathlib
import os
import json

from concurrent.futures import ThreadPoolExecutor
from requests_futures.sessions import FuturesSession

# To load test I ran this script whilst simultaneously interacting with the application
# interactively to see how it was responding.
# Tests tried:
# * from 15 to 150 concurrent users (no autoscaling)
# * from 100 to 300 concurrent users (autoscales to two pods)
parser = argparse.ArgumentParser(description='Process some integers.')
parser.add_argument('--max-concurrent-users', dest='max_concurrent_users', type=int, default=150)
parser.add_argument('--min-concurrent-users', dest='min_concurrent_users', type=int, default=15)

ENDPOINT = "http://spell-org.spell-org.spell.services/spell-org/paint_with_ml/predict"
with open(pathlib.Path(os.getcwd()).parent / 'test_payload.json', 'r') as fp:
    PAYLOAD = json.load(fp)

args = parser.parse_args()
max_requests_per_second = args.max_concurrent_users // 15
min_requests_per_second = args.min_concurrent_users // 15
curr_requests_per_second = min_requests_per_second
already_peeked = False
t = 0

# assuming a maximum of 8 seconds of latency (serving on GPU averages 4 seconds)
session = FuturesSession(executor=ThreadPoolExecutor(max_workers=8 * max_requests_per_second))

while True:
    t += 1
    # we can't inspect the response for errors because .result() is a blocking function so
    # we're relying on model server metrics to tell us how we're doing
    for _ in range(curr_requests_per_second):
        _ = session.get(ENDPOINT)

    if t % 15 == 0:
        if not already_peeked:
            curr_requests_per_second += 1
            if curr_requests_per_second == max_requests_per_second:
                already_peeked = True
        else:
            curr_requests_per_second -= 1
            if curr_requests_per_second == 0:
                break

    print(f"Sent {curr_requests_per_second} requests at time {t}. Sleeping for 1 second...")

    # this assumes that making the request is instantaneous, which, for small enough volumes, it
    # basically is
    time.sleep(1)
