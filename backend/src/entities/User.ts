import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToMany,
  Index
} from 'typeorm';
import { IsEmail, MinLength, IsEnum } from 'class-validator';
import { UserRole } from '../../../shared/types';
import { Project } from './Project';
import { PunchlistItem } from './PunchlistItem';
import { Note } from './Note';

@Entity('users')
@Index(['email'], { unique: true })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  @IsEmail()
  email: string;

  @Column()
  @MinLength(6)
  password: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({
    type: 'text',
    default: UserRole.CONTRACTOR
  })
  
  @IsEnum(UserRole)
  role: UserRole;

  @Column()
  company: string;

  @Column({ nullable: true })
  phone?: string;

  @Column({ nullable: true })
  avatar?: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  lastLoginAt?: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @OneToMany(() => Project, project => project.createdBy)
  createdProjects: Project[];

  @ManyToMany(() => Project, project => project.assignedUsers)
  assignedProjects: Project[];

  @OneToMany(() => PunchlistItem, item => item.createdBy)
  createdItems: PunchlistItem[];

  @OneToMany(() => PunchlistItem, item => item.assignedTo)
  assignedItems: PunchlistItem[];

  @OneToMany(() => Note, note => note.createdBy)
  notes: Note[];

  // Virtual properties
  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  get displayName(): string {
    return this.fullName;
  }
}




