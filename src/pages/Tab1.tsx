import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import ExploreContainer from '../components/ExploreContainer';
import './Tab1.css';

import React, { useState, useEffect } from 'react';
import { API } from 'aws-amplify';
import { listNotes } from '../graphql/queries';
import { createNote as createNoteMutation, deleteNote as deleteNoteMutation } from '../graphql/mutations';

type Note = {
    id: string
    name: string
    description?: string
};

const initialFormState = { name: '', description: '' }

const Tab1: React.FC = () => {

    const [notes, setNotes] = useState([] as Note[]);
    const [formData, setFormData] = useState(initialFormState);

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

        // (API.graphql(graphqlOperation(createAttributeMutation, { input: payload })) as unknown) as {
        //     data: CreateAttributeMutation
        // }
        setNotes(apiData.data?.listNotes.items);
    }

    async function createNote() {
        if (!formData.name || !formData.description) return;
        console.log("sending this to graph ql api");
        console.log(formData);
        await API.graphql({ query: createNoteMutation, variables: { input: formData } });
        setNotes([ ...notes, { id: '', ...formData} ]);
        setFormData(initialFormState);
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
          <button onClick={createNote}>Create Note</button>
          <div style={{marginBottom: 30}}>
              {
                  notes.map(note => (
                      <div key={note.id || note.name}>
                          <h2>{note.name}</h2>
                          <p>{note.description}</p>
                          <button onClick={() => deleteNote(note)}>Delete note</button>
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
