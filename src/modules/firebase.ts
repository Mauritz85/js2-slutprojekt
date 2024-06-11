

import { initializeApp } from "firebase/app";
import { getDatabase, ref, get, update, push } from "firebase/database";


const firebaseConfig = {

    apiKey: "AIzaSyAkCcIGNX0d95oOdHrBCM7CIckQIFysSyM",
    authDomain: "social-media-dafb7.firebaseapp.com",
    databaseURL: "https://social-media-dafb7-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "social-media-dafb7",
    storageBucket: "social-media-dafb7.appspot.com",
    messagingSenderId: "1098814061452",
    appId: "1:1098814061452:web:8ea2c078be56f3406f34a9"

};


const app = initializeApp(firebaseConfig);
const db = getDatabase(app)


let userValidated = false

async function userValidation(username: string, password: string) {
    const firebaseUsers = await get(ref(db, '/users/'))


    if (firebaseUsers.val()[username] == undefined) {
        userValidated = false
    }

    else if (firebaseUsers.val()[username].password == password) {
        userValidated = true
    }

    else {
        userValidated = false
    }

}

let userImg: string

async function getUserImg(username: string) {
    const firebaseUsers = await get(ref(db, '/users/' + username))
    if (firebaseUsers.val() == null) { return }
    else {
        userImg = firebaseUsers.val().img
        return userImg
    }

}

getUserImg('ny')

let userAdded: boolean

async function addUserToFirebase(username: string, password: string, img: string) {
    const firebaseUsers = await get(ref(db, '/users/'))

    if (firebaseUsers.val() == null || firebaseUsers.val()[username] == undefined) {

        update(ref(db, '/users/' + username), {
            username: username,
            password: password,
            img: img
        })
        userAdded = true

    }

    else if (firebaseUsers.val()[username] === username) {
        userAdded = false
    }

}

let timestamp: string

function getTimestamp() {
    const date = new Date();
    const dateToString = date.toString();
    const dateSplit = dateToString.split(' ');
    timestamp = `${dateSplit[1]} ${dateSplit[2]} ${dateSplit[3]} ${dateSplit[4]}`;

}


async function addEntryToFirebase(username: string, entry: string) {
    getTimestamp()
    push(ref(db, '/statusUpdates/' + username), {
        entry: entry,
        time: timestamp

    })
}


let entries: any

async function getStatusUpdates(username: string) {

    const statusUpdates = await get(ref(db, '/statusUpdates/' + username))
    const entryData = statusUpdates.val()
    if (entryData == undefined) {
        return entries = null
    }
    else {
        entries = Object.entries(entryData);
    }



}

let members: any

async function getMembers() {
    const firebaseUsers = await get(ref(db, '/users/'))
    members = Object.entries(firebaseUsers.val())


}



export { userValidation, userValidated, addUserToFirebase, userAdded, getStatusUpdates, entries, addEntryToFirebase, getUserImg, userImg, getMembers, members }