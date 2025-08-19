import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  Index
} from 'typeorm';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { Trade, Priority, ItemStatus } from '../../../shared/types';
import { User } from './User';
import { Project } from './Project';
import { Photo } from './Photo';
import { Note } from './Note';

@Entity('punchlist_items')
@Index(['projectId', 'status'])
@Index(['assignedTo', 'status'])
export class PunchlistItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @IsNotEmpty()
  title: string;

  @Column({ type: 'text' })
  @IsNotEmpty()
  description: string;

  @Column()
  @IsNotEmpty()
  location: string;

  @Column({
    type: 'text',
    default: Trade.GENERAL
  })
  @IsEnum(Trade)
  trade: Trade;

  @Column({
    type: 'text',
    default: Priority.MEDIUM
  })
  @IsEnum(Priority)
  priority: Priority;

  @Column({
    type: 'text',
    default: ItemStatus.OPEN
  })
  @IsEnum(ItemStatus)
  status: ItemStatus;

  @Column({ type: 'date', nullable: true })
  dueDate?: Date;

  @Column({ type: 'datetime', nullable: true })
  completedDate?: Date;

  @Column({ type: 'datetime', nullable: true })
  verifiedDate?: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Project, project => project.punchlistItems, { onDelete: 'CASCADE' })
  project: Project;

  @Column()
  projectId: string;

  @ManyToOne(() => User, user => user.createdItems)
  createdBy: User;

  @ManyToOne(() => User, user => user.assignedItems, { nullable: true })
  assignedTo?: User;

  @OneToMany(() => Photo, photo => photo.punchlistItem)
  photos: Photo[];

  @OneToMany(() => Note, note => note.punchlistItem)
  notes: Note[];

  // Virtual properties
  get isOverdue(): boolean {
    if (!this.dueDate) return false;
    return new Date() > new Date(this.dueDate) && this.status !== ItemStatus.COMPLETED && this.status !== ItemStatus.VERIFIED;
  }

  get daysSinceDue(): number {
    if (!this.dueDate) return 0;
    const today = new Date();
    const due = new Date(this.dueDate);
    return Math.floor((today.getTime() - due.getTime()) / (1000 * 60 * 60 * 24));
  }

  get statusLabel(): string {
    return this.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  }
}