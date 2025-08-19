import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  ManyToMany,
  OneToMany,
  JoinTable,
  Index
} from 'typeorm';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { ProjectStatus } from '../../../shared/types';
import { User } from './User';
import { PunchlistItem } from './PunchlistItem';

@Entity('projects')
@Index(['name', 'clientName'])
export class Project {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @IsNotEmpty()
  name: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column()
  @IsNotEmpty()
  address: string;

  @Column()
  @IsNotEmpty()
  city: string;

  @Column()
  @IsNotEmpty()
  state: string;

  @Column()
  @IsNotEmpty()
  zipCode: string;

  @Column()
  @IsNotEmpty()
  clientName: string;

  @Column({ type: 'date' })
  startDate: Date;

  @Column({ type: 'date', nullable: true })
  endDate?: Date;

  @Column({
    type: 'text',
    default: ProjectStatus.PLANNING
  })
  
  @IsEnum(ProjectStatus)
  status: ProjectStatus;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  budget?: number;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => User, user => user.createdProjects)
  createdBy: User;

  @ManyToMany(() => User, user => user.assignedProjects)
  @JoinTable({
    name: 'project_users',
    joinColumn: { name: 'projectId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'userId', referencedColumnName: 'id' }
  })
  assignedUsers: User[];

  @OneToMany(() => PunchlistItem, item => item.project)
  punchlistItems: PunchlistItem[];

  // Virtual properties
  get fullAddress(): string {
    return `${this.address}, ${this.city}, ${this.state} ${this.zipCode}`;
  }

  get isActive(): boolean {
    return this.status === ProjectStatus.IN_PROGRESS || this.status === ProjectStatus.PLANNING;
  }

  get totalItems(): number {
    return this.punchlistItems?.length || 0;
  }

  get completedItems(): number {
    return this.punchlistItems?.filter(item => 
      item.status === 'completed' || item.status === 'verified'
    ).length || 0;
  }

  get completionPercentage(): number {
    if (this.totalItems === 0) return 0;
    return Math.round((this.completedItems / this.totalItems) * 100);
  }
}



