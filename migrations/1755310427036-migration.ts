import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1755310427036 implements MigrationInterface {
  name = 'Migration1755310427036';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(100) NOT NULL, "email" character varying(255) NOT NULL, "password" character varying(255) NOT NULL, "refreshToken" character varying(500), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id")); COMMENT ON COLUMN "users"."name" IS 'Nome completo do usuário'; COMMENT ON COLUMN "users"."email" IS 'Email único do usuário'; COMMENT ON COLUMN "users"."password" IS 'Senha criptografada do usuário'; COMMENT ON COLUMN "users"."refreshToken" IS 'Token de refresh para autenticação'; COMMENT ON COLUMN "users"."createdAt" IS 'Data de criação do registro'; COMMENT ON COLUMN "users"."updatedAt" IS 'Data da última atualização'`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_51b8b26ac168fbe7d6f5653e6c" ON "users" ("name") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_97672ac88f789774dd47f7c8be" ON "users" ("email") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_97672ac88f789774dd47f7c8be"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_51b8b26ac168fbe7d6f5653e6c"`,
    );
    await queryRunner.query(`DROP TABLE "users"`);
  }
}
