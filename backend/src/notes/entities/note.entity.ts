import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Note {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: '' })
  title: string;

  @Column({ default: '', length: 1000 })
  content: string;

  @Column({ default: false })
  isArchived: boolean;

  constructor(note: Partial<Note>) {
    Object.assign(this, note);
  }
}
