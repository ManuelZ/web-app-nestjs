
import { useState } from 'react'
import { Card, Button, Textarea, Dropdown, DropdownItem, TextInput } from "flowbite-react";


export const NewCard = ({ onClickHandler }) => {
    return (
        <div className="w-full overflow-hidden" >
            <Card onClick={onClickHandler}>
                <div className='flex items-center justify-center'>
                    <p className="text-2xl text-gray-400 dark:text-gray-500">
                        <svg className="w-8 h-8" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 18 18">
                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 1v16M1 9h16" />
                        </svg>
                    </p>
                </div>
            </Card>
        </div>
    )
}


export const NoteCard = ({ id, title, content, isArchived, handleDeleteClick, handleEditSubmit, handleArchiveClick }) => {
    const [edit, setEdit] = useState(false);

    if (content.trim() === "") {
        content = "Empty note";
    }

    return (
        <div className="w-full overflow-hidden" >
            <Card>

                {
                    edit ? <>
                        <form className="space-y-3" onSubmit={event => { handleEditSubmit(event, id); setEdit(false) }}>
                            <TextInput id="noteTitle" name="noteTitle" type="text" placeholder="Title" defaultValue={title} />
                            <Textarea
                                defaultValue={content}
                                id="messages"
                                rows="4"
                                name="noteContent"
                            />
                            <div className="flex items-center justify-around">
                                <Button type="submit">Save</Button>
                                <Button onClick={event => setEdit(false)}>Cancel</Button>
                            </div>
                        </form>
                    </>
                        :
                        <>
                            < div className='flex flex-row justify-between' >
                                <h5 className="text-ellipsis overflow-hidden text-xl font-medium text-gray-900 dark:text-white">{title}</h5>
                                <Dropdown inline label="">
                                    <DropdownItem onClick={event => setEdit(true)}>
                                        <a
                                            href="#"
                                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-600 dark:hover:text-white"
                                        >
                                            Edit
                                        </a>
                                    </DropdownItem>

                                    <DropdownItem onClick={event => handleDeleteClick(id)}>
                                        <a
                                            href="#"
                                            className="block px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                                        >
                                            Delete
                                        </a>
                                    </DropdownItem>
                                    <DropdownItem onClick={event => handleArchiveClick(id, !isArchived)}>
                                        <a
                                            href="#"
                                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-600 dark:hover:text-white"
                                        >
                                            {isArchived ? "Unarchive" : "Archive"}
                                        </a>
                                    </DropdownItem>
                                </Dropdown>
                            </div >
                            <span className="text-ellipsis overflow-hidden text-sm text-gray-500 dark:text-gray-400">{content}</span>
                        </>
                }

                {isArchived ? <span className="text-sm font-semibold text-gray-500 dark:text-gray-400 text-end">Archived</span> : ""}
            </Card >
        </div >
    );
};
