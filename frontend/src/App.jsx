import { useState, useEffect } from 'react'
import { Button, Textarea, Modal, TextInput, Sidebar, SidebarItemGroup, SidebarItems, SidebarItem } from "flowbite-react";
import { HiMinus, HiArrowRight } from "react-icons/hi";
import { NewCard, NoteCard } from "./components/NoteCard"
import { HiInformationCircle } from "react-icons/hi";
import { Alert } from "flowbite-react";

const App = () => {
  const [notes, setNotes] = useState({});
  const [openModal, setOpenModal] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  const [error, setError] = useState(null);


  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch(`http://${import.meta.env.VITE_BACKEND_URL}/api/notes/${showArchived ? 'archived' : 'active'}`);
      const notesArray = await response.json();
      let notesDict = Object.fromEntries(notesArray.map(x => [x.id, x]));
      setNotes(notesDict);
    }

    fetchData().catch(console.error);
  }, [showArchived]);

  const handleNoteCreateSubmit = async (event) => {
    event.preventDefault();

    const formData = new FormData(event.target);
    const noteContent = formData.get("noteContent")
    const noteTitle = formData.get("noteTitle")

    const payload = {
      "title": noteTitle,
      "content": noteContent
    }

    const headers = new Headers({
      "Content-Type": "application/json"
    });

    try {
      const response = await fetch(`http://${import.meta.env.VITE_BACKEND_URL}/api/notes`, {
        method: "POST",
        headers: headers,
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(`${err.statusCode} ${err.message}`);
      }

      const responseContent = await response.json();

      setNotes({ [responseContent["id"]]: responseContent, ...notes });
      setOpenModal(false);
    }
    catch (error) {
      setError(error.message);
      console.error(error);
    }
  }

  const handleNoteEditSubmit = async (event, id) => {
    event.preventDefault();

    const formData = new FormData(event.target);
    const noteContent = formData.get("noteContent")
    const noteTitle = formData.get("noteTitle")

    const headers = new Headers({
      "Content-Type": "application/json"
    });

    try {

      await fetch(`http://${import.meta.env.VITE_BACKEND_URL}/api/notes/${id}`, {
        method: "PATCH",
        headers: headers,
        body: JSON.stringify({
          "title": noteTitle,
          "content": noteContent
        }),
      });

      const { [id]: editedNote, ...rest } = notes;
      editedNote["title"] = noteTitle;
      editedNote["content"] = noteContent;
      rest[id] = editedNote;
      setNotes(rest);

    }
    catch (error) {
      console.error(error)
    }
  }

  const handleNoteDeleteClick = async (id) => {

    const headers = new Headers({
      "Content-Type": "application/json"
    });

    try {

      await fetch(`http://${import.meta.env.VITE_BACKEND_URL}/api/notes/${id}`, {
        method: "DELETE",
        headers: headers,
      });

      const { [id]: tmp, ...rest } = notes;
      setNotes(rest);

    }
    catch (error) {
      console.error(error)
    }
  }

  const handleNoteArchiveClick = async (id, archiveStatus) => {

    const headers = new Headers({
      "Content-Type": "application/json"
    });

    try {

      await fetch(`http://${import.meta.env.VITE_BACKEND_URL}/api/notes/${id}`, {
        method: "PATCH",
        headers: headers,
        body: JSON.stringify({ "isArchived": archiveStatus }),
      });

      const { [id]: editedNote, ...rest } = notes;
      editedNote["isArchived"] = archiveStatus;
      rest[id] = editedNote;
      setNotes(rest);
    }
    catch (error) {
      console.error(error)
    }
  }

  const noteCards = Object.values(notes).reduce((result, note) => {

    const noteCard = (
      <NoteCard {...note}
        key={note.id}
        handleDeleteClick={handleNoteDeleteClick}
        handleEditSubmit={handleNoteEditSubmit}
        handleArchiveClick={handleNoteArchiveClick}
      />)

    if (showArchived && note.isArchived) {
      result.push(noteCard);
    } else if (!showArchived && !note.isArchived) {
      result.push(noteCard);
    }
    return result;

  }, [<NewCard key={0} onClickHandler={() => setOpenModal(true)} />]);


  return (
    <div className="min-h-full">

      <header className="bg-gray-50 shadow">
        <div className="mx-auto flex flex-row justify-around max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Notes App</h1>

          {
            error ? <Alert color="failure" icon={HiInformationCircle}>
              <span className="font-medium">Error </span> {error}
            </Alert> : ""
          }

        </div>
      </header>

      <div className='flex flex-row py-6 px-2 sm:px-4 lg:px-6'>

        <Sidebar>
          <SidebarItems>
            <SidebarItemGroup>
              <SidebarItem icon={showArchived ? HiMinus : HiArrowRight} onClick={() => { setShowArchived(false) }}>
                Active notes
              </SidebarItem>
              <SidebarItem icon={showArchived ? HiArrowRight : HiMinus} onClick={() => { setShowArchived(true) }}>
                Archived notes
              </SidebarItem>
            </SidebarItemGroup>
          </SidebarItems>
        </Sidebar>

        <Modal show={openModal} size="md" onClose={() => setOpenModal(false)} popup>
          <Modal.Header />
          <Modal.Body>
            <form className="space-y-3" onSubmit={handleNoteCreateSubmit}>
              <h3 className="text-xl font-medium text-gray-900 dark:text-white">Create new note</h3>
              <TextInput id="noteTitle" name="noteTitle" type="text" placeholder="Title" />
              <Textarea
                className="block p-3 h-full w-full text-sm text-gray-900 bg-white rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                id="noteContent"
                name="noteContent"
                rows="4"
                required
                placeholder="Content"
              />
              <div className="w-full flex flex-row justify-around items-center">
                <Button type="submit">Create</Button>
                <Button onClick={() => setOpenModal(false)}>Cancel</Button>
              </div>
            </form>
          </Modal.Body>
        </Modal>

        <main className='container mx-auto max-w-7xl h-full'>

          <div className="flex flex-col gap-3 h-full overflow-hidden">
            {noteCards}
          </div>

        </main>

      </div>
    </div >
  )
}

export default App;
