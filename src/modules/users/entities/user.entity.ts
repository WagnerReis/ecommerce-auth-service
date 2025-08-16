import { Exclude } from 'class-transformer';
import { IsEmail, MaxLength, MinLength } from 'class-validator';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('users')
@Index(['email'], { unique: true })
@Index(['name'])
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar', {
    length: 100,
    nullable: false,
    comment: 'Nome completo do usuário',
  })
  @MinLength(2, { message: 'Nome deve ter pelo menos 2 caracteres' })
  @MaxLength(100, { message: 'Nome não pode exceder 100 caracteres' })
  name: string;

  @Column('varchar', {
    length: 255,
    nullable: false,
    unique: true,
    comment: 'Email único do usuário',
  })
  @IsEmail({}, { message: 'Email deve ser válido' })
  email: string;

  @Column('varchar', {
    length: 255,
    nullable: false,
    comment: 'Senha criptografada do usuário',
  })
  @MinLength(8, { message: 'Senha deve ter pelo menos 8 caracteres' })
  @Exclude({ toPlainOnly: true })
  password: string;

  @Column('varchar', {
    length: 500,
    nullable: true,
    comment: 'Token de refresh para autenticação',
  })
  @Exclude({ toPlainOnly: true })
  refreshToken: string;

  @CreateDateColumn({
    comment: 'Data de criação do registro',
  })
  createdAt: Date;

  @UpdateDateColumn({
    comment: 'Data da última atualização',
  })
  updatedAt: Date;

  /**
   * Hook executado antes de inserir um novo usuário
   */
  @BeforeInsert()
  beforeInsert() {
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  /**
   * Hook executado antes de atualizar um usuário
   */
  @BeforeUpdate()
  beforeUpdate() {
    this.updatedAt = new Date();
  }

  constructor(data: Partial<User>) {
    Object.assign(this, data);
  }
}
