import unleashServer, { IAuthType } from "unleash-server";

async function bootstrap() {
  const unleash = await unleashServer.start({
    db: {
      ssl: false,
      host: "localhost",
      port: 5432,
      database: "goblinsquire",
      user: "postgres",
      password: "bvc8hdys",
    },
    authentication: {
      type: IAuthType.OPEN_SOURCE,
    },
    server: {
      port: 4242,
    },
  });

  console.log(`Unleash started on http://localhost:${unleash.app.get("port")}`);
}

bootstrap();
