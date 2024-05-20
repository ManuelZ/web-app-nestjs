import { useState, useEffect } from 'react'
import { Button, Textarea, Modal, TextInput, Sidebar, SidebarItemGroup, SidebarItems, SidebarItem } from "flowbite-react";
import { HiDocumentText, HiArchive } from "react-icons/hi";
import { NewCard, NoteCard } from "./components/NoteCard"


const App = () => {
  const [notes, setNotes] = useState({});
  const [openModal, setOpenModal] = useState(false);
  const [showArchived, setShowArchived] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch(`http://localhost:3000/api/notes/${showArchived ? 'archived' : 'active'}`);
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
      const response = await fetch(`http://localhost:3000/api/notes`, {
        method: "POST",
        headers: headers,
        body: JSON.stringify(payload),
      });

      const responseContent = await response.json();

      setNotes({ [responseContent["id"]]: responseContent, ...notes });
      setOpenModal(false);
    }
    catch (error) {
      console.error(error)
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

      await fetch(`http://localhost:3000/api/notes/${id}`, {
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

      await fetch(`http://localhost:3000/api/notes/${id}`, {
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

      await fetch(`http://localhost:3000/api/notes/${id}`, {
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
    <>
      <div className="min-h-full">

        <header className="bg-white shadow">
          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Notes App</h1>
          </div>
        </header>

        <div className='flex flex-row py-6 px-2 sm:px-6 lg:px-8'>

          <Sidebar aria-label="Default sidebar example">
            <SidebarItems>
              <SidebarItemGroup>
                <SidebarItem href="#" icon={HiDocumentText} onClick={() => { setShowArchived(false) }}>
                  Active notes
                </SidebarItem>
                <SidebarItem href="#" icon={HiArchive} onClick={() => { setShowArchived(true) }}>
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
                  onChange={() => { console.log("Change") }}
                  id="noteContent"
                  name="noteContent"
                  rows="4"
                  required
                  placeholder="Content"
                />
                <div className="w-full flex flex-row justify-around items-center">
                  <Button type="submit">Create</Button>
                  <Button>Cancel</Button>
                </div>
              </form>
            </Modal.Body>
          </Modal>

          <main className='container mx-auto max-w-7xl h-full'>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 h-full overflow-hidden">
              {noteCards}
            </div>

          </main>

        </div>
      </div >
    </>
  )
}

export default App;
