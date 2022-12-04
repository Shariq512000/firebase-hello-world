import { useState, useEffect } from "react";
import moment from 'moment';
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import {
  collection, addDoc, getDocs, query,
  onSnapshot, serverTimestamp,
  Timestamp, updateDoc, doc, orderBy, deleteDoc,
} from "firebase/firestore";
import "./Post.css";
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Icon from '@mui/material/Icon';
import IconButton from '@mui/material/IconButton';
import { MdDelete } from 'react-icons/md';
import { AiTwotoneEdit } from 'react-icons/ai';
import { FaShare } from 'react-icons/fa';
import { GrUpdate } from 'react-icons/gr';


// import DeleteIcon from '@mui/icons-material/Delete';
// import DeleteForeverIcon from '@mui/icons-material/DeleteForever';



// TODO: Replace the following with your app's Firebase project configuration
// See: https://firebase.google.com/docs/web/learn-more#config-object
const firebaseConfig = {
  apiKey: "AIzaSyDoErx1B0JJ160aqTwsORQDc1gGajQI9Do",
  authDomain: "hellopost-76cce.firebaseapp.com",
  projectId: "hellopost-76cce",
  storageBucket: "hellopost-76cce.appspot.com",
  messagingSenderId: "318739311512",
  appId: "1:318739311512:web:c93b4b093e069cd13959ed"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);


// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(app);

// const docRef = doc(db, 'objects', 'some-id');

// const updateTimestamp = async() => {await updateDoc(docRef, {
//   timestamp: serverTimestamp()
// });
// }

function Post() {

  const [posts, setPosts] = useState([]);
  const [postText, setPostText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  // const [isEditing, setIsEditing] = useState (null);
  // const [isEditingText, setIsEditingText] = useState("");
  const [editing, setEditing] = useState({
    editingId: null,
    editingText: ""
  }
  )






  useEffect(() => {

    const getData = async () => {
      const querySnapshot = await getDocs(collection(db, "posts"));
      querySnapshot.forEach((doc) => {
        console.log(`${doc.id} => `, doc.data());


        setPosts((prev) => {
          let newArray = [...prev, doc.data()];

          return newArray;

        });
      });
    }
    // getData();
    let unsubscribe = null;
    const getRealTimeData = async () => {
      const q = query(collection(db, "posts"), orderBy("createdOn", "desc"));
      unsubscribe = onSnapshot(q, (querySnapshot) => {
        const posts = [];
        querySnapshot.forEach((doc) => {
          let data = doc.data()
          data.id = doc.id;
          posts.push(data);
        });
        setPosts(posts);
        console.log("Posts: ", posts);
      });
    }

    getRealTimeData();

    return () => {
      console.log("cleanup function");
      unsubscribe()
    };



  }, [])




  const savePost = async (e) => {
    e.preventDefault();

    console.log("PostText: ", postText);

    try {
      const docRef = await addDoc(collection(db, "posts"), {
        text: postText,
        createdOn: serverTimestamp(),
      });
      console.log("Document written with ID: ", docRef.id);
    } catch (e) {
      console.error("Error adding document: ", e);
    }

  }
  const deletePost = async (postId) => {
    await deleteDoc(doc(db, "posts", postId));
  }

  const updatePost = async (e) => {
    e.preventDefault()
    await updateDoc(doc(db, "posts", editing.editingId), {
      text: editing.editingText
    });
    setEditing({
      editingId: null,
      editingText: ""
    })
  }
  const edit = async (postId, text) => {
    setEditing({
      editingId: postId,
      editingText: text
    })


    // const updatedState =
    // posts.map(eachItem => {
    //   if(eachItem.id === postId){
    //     return {...eachItem, isEditing: !eachItem.isEditing}

    //   }
    //   else{
    //     return eachItem
    //   }
    // })
    // setPosts(updatedState)
  }



  return (
    <div className="main">

      <form onSubmit={savePost}>
        <textarea
          type="text"
          placeholder="What's in your mind..."
          onChange={(e) => {
            setPostText(e.target.value)
          }}
        />
        <br />
        <IconButton type="submit" style={{color: "green"}}><FaShare/></IconButton>
      </form>
      <br />
      <br />

      <div className="cent">
        {(isLoading) ? "loading..." : ""}

        {posts.map((eachPost, i) => (
          <div className="post" key={i}>

            <h3
              className="title"
              href={eachPost?.url}
              target="_blank" rel="noreferrer"
            >
              {(eachPost.id === editing.editingId) ?
                <form onSubmit={updatePost}>
                  <input type="text" value={editing.editingText}
                    onChange={
                      (e) => {
                        setEditing({ ...editing, editingText: e.target.value })
                      }
                    } />
                  <IconButton type="submit" style={{color: "green"}}><GrUpdate/></IconButton>

                </form>
                : eachPost?.text}
            </h3>

            <span>{
              moment((eachPost?.createdOn?.seconds) ? eachPost?.createdOn?.seconds * 1000
                :
                undefined
              )
                .format('Do MMMM, h:mm a')
            }</span>
            <br /><br />
            <IconButton onClick={() => {
              deletePost(eachPost?.id)
            }
            } style={{color: "red"}}><MdDelete/></IconButton>
            {

              (editing.editingId === eachPost?.id) ? null :

                <IconButton onClick={() => {

                  setEditing({
                    editingId: eachPost?.id,
                    editingText: eachPost?.text
                  })


                }} style={{color: "blue"}}><AiTwotoneEdit/></IconButton>
            }



          </div>
        ))}
      </div>

    </div>
  );
}

export default Post;