set -e

firstStartInsightAPI=false
if [ "`docker-compose ps | grep [i]nsightapi | wc -l | awk '{print $1}'`" == "0" ] ; then
    firstStartInsightAPI=true
    docker-compose up -d mongo
    echo "Sleep 5s..."
    sleep 5
fi

docker-compose up -d

if [ "$firstStartInsightAPI" = "true" ] ; then
    echo "Sleep 10s..."
    sleep 10
fi

echo "Try to init accounts..."
docker-compose exec insightapi bash -c init-accounts.sh
