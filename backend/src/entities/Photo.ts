import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  Index
} from 'typeorm';
import { IsNotEmpty, IsUrl } from 'class-validator';
import { User } from './User';
import { PunchlistItem } from './PunchlistItem';

@Entity('photos')
@Index(['punchlistItemId'])
export class Photo {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @IsNotEmpty()
  @IsUrl()
  url: string;

  @Column()
  @IsNotEmpty()
  @IsUrl()
  thumbnailUrl: string;

  @Column({ nullable: true })
  caption?: string;

  @Column()
  @IsNotEmpty()
  originalName: string;

  @Column()
  @IsNotEmpty()
  mimeType: string;

  @Column()
  fileSize: number;

  @Column({ type: 'datetime' })
  takenAt: Date;

  @CreateDateColumn()
  uploadedAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => PunchlistItem, item => item.photos, { onDelete: 'CASCADE' })
  punchlistItem: PunchlistItem;

  @Column()
  punchlistItemId: string;

  @ManyToOne(() => User, user => user)
  uploadedBy: User;

  // Virtual properties
  get fileSizeFormatted(): string {
    const bytes = this.fileSize;
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  get isImage(): boolean {
    return this.mimeType.startsWith('image/');
  }
}