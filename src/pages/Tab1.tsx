import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import ExploreContainer from '../components/ExploreContainer';
import './Tab1.css';

import React, { useState, useEffect } from 'react';
import { API, Storage} from 'aws-amplify';
import { listNotes } from '../graphql/queries';
import { createNote as createNoteMutation, deleteNote as deleteNoteMutation } from '../graphql/mutations';

type Note = {
    id: string
    name: string
    description?: string
    image: string
};

type FormData = {
    name: string
    description?: string
    image: string
}

const initialFormState = { name: '', description: '', image:'' }

const Tab1: React.FC = () => {

    const [notes, setNotes] = useState([] as Note[]);
    const [formData, setFormData] = useState<FormData>(initialFormState);

    useEffect(() => {
        fetchNotes();
    }, []);

    async function fetchNotes() {
        const apiData = await (API.graphql({ query: listNotes }) as unknown) as {
            data?: { listNotes: {items: any} };
            errors?: [object];
            extensions?: {
                [key: string]: any;
            };
        };
        console.log("items:");
        console.log(apiData.data?.listNotes.items);
        const notesFromAPI = apiData.data?.listNotes.items as Note[];
        await Promise.all(notesFromAPI.map(async note => {
            console.log("fetching note");
            console.log(note);
            if (note.image) {
                console.log("try to load image: ");
                console.log(note.image);
            // const image = await Storage.get(note.image.toString());
            const image = await Storage.get("testimage.png");
            console.log("this is what we get from storage:")
            console.log(image)
                note.image = image as string;
            }
            return note;
        }))
        setNotes(apiData.data?.listNotes.items);
    }

    async function createNote() {
        if (!formData.name || !formData.description) return;
        console.log("create note with form date:");
        console.log(formData);
        await API.graphql({ query: createNoteMutation, variables: { input: {...formData, "audio": "myShinyAudio" } }});
        if (formData.image) {
            const image = await Storage.get(formData.image);
            formData.image = image as string;
        }
        setNotes([ ...notes, { id: '', ...formData} ]);
        setFormData(initialFormState);
    }

    async function onChange(e:any) {
        if (!e.target.files[0]) return
        const file = e.target.files[0];
        console.log("lets put a file to storage");
        setFormData({ ...formData, image: file.name });
        await Storage.put(file.name, file);
        fetchNotes();
    }

    // @ts-ignore
    async function deleteNote({ id }) {
        const newNotesArray = notes.filter(note => note.id !== id);
        setNotes(newNotesArray);
        await API.graphql({ query: deleteNoteMutation, variables: { input: { id } }});
    }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Tab 1</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Tab 1</IonTitle>
          </IonToolbar>
        </IonHeader>
          <h1>My Notes App</h1>
          <input
              onChange={e => setFormData({ ...formData, 'name': e.target.value})}
              placeholder="Note name"
              value={formData.name}
          />
          <input
              onChange={e => setFormData({ ...formData, 'description': e.target.value})}
              placeholder="Note description"
              value={formData.description}
          />
          <input
          type="file"
          onChange={onChange}
      />
          <button onClick={createNote}>Create Note</button>
          <div style={{marginBottom: 30}}>
              {
                  notes.map(note => (
                      <div key={note.id || note.name}>
                          <h2>{note.name}</h2>
                          <p>{note.description}</p>
                          <button onClick={() => deleteNote(note)}>Delete note</button>
                          {
                              note.image && <img src={note.image.toString()} style={{width: 400}} />
                          }
                      </div>
                  ))
              }
          </div>

        <ExploreContainer name="Tab 1 page" />
      </IonContent>
    </IonPage>
  );
};

export default Tab1;
