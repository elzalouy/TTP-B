**Create and Start container**
- docker compose up -d

**start container and rebuild image**
- docker compose up -d --build

**build image without start a container**
- docker compose build

**stop container and delete**
- docker compose down

**delete volume with container**
- docker compose down -v

**Create image**
- docker image build -t mohamednage/trello-backend .
- docker push mohamednage/trello-backend

**start project in development**
- yarn run dev

**start project in production**
- yarn run build
- yarn start

**start ngrok server in windows**
- ngrok http 5000 --region au
