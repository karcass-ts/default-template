import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity({ name: 'message' })
export class Message {
    @PrimaryGeneratedColumn()
    public id!: number

    @Column('bigint')
    public timestamp!: number

    @Column('text')
    public text!: string
}
