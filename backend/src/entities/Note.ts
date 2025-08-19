import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    Index
  } from 'typeorm';
  import { IsNotEmpty } from 'class-validator';
  import { User } from './User';
  import { PunchlistItem } from './PunchlistItem';
  
  @Entity('notes')
  @Index(['punchlistItemId', 'createdAt'])
  export class Note {
    @PrimaryGeneratedColumn('uuid')
    id: string;
  
    @Column({ type: 'text' })
    @IsNotEmpty()
    content: string;
  
    @CreateDateColumn()
    createdAt: Date;
  
    @UpdateDateColumn()
    updatedAt: Date;
  
    // Relations
    @ManyToOne(() => PunchlistItem, item => item.notes, { onDelete: 'CASCADE' })
    punchlistItem: PunchlistItem;
  
    @Column()
    punchlistItemId: string;
  
    @ManyToOne(() => User, user => user.notes)
    createdBy: User;
  
    // Virtual properties
    get excerpt(): string {
      return this.content.length > 100 
        ? this.content.substring(0, 100) + '...'
        : this.content;
    }
  
    get isRecent(): boolean {
      const oneDayAgo = new Date();
      oneDayAgo.setDate(oneDayAgo.getDate() - 1);
      return this.createdAt > oneDayAgo;
    }
  }