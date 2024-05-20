import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { Note } from './entities/note.entity';
import { Logger } from '@nestjs/common';
@Injectable()
export class NotesService {
  constructor(
    @InjectRepository(Note)
    private readonly notesRepository: Repository<Note>,
    private readonly entityManager: EntityManager,
  ) {}

  create(createNoteDto: CreateNoteDto): Promise<Note> {
    const note = new Note(createNoteDto);
    return this.entityManager.save(note);
  }

  async findByArchivedStatus(archived: boolean): Promise<Note[]> {
    return this.notesRepository
      .createQueryBuilder('user')
      .where('user.isArchived = :archived', { archived: archived })
      .getMany();
  }

  async findAll(): Promise<Note[]> {
    return this.notesRepository.find();
  }

  findOne(id: number): Promise<Note> {
    return this.notesRepository.findOneBy({ id: id });
  }

  update(id: number, updateNoteDto: UpdateNoteDto) {
    return this.notesRepository.update(id, updateNoteDto);
  }

  async remove(id: number): Promise<void> {
    await this.notesRepository.delete(id);
  }
}
