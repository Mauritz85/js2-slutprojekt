
import { addEntryToFirebase, getStatusUpdates, entries, userImg, userValidated, getUserImg, userValidation, userAdded, addUserToFirebase, getMembers, members } from "../modules/firebase.ts";
import duckImg from '../images/duck.jpg';
import flowerImg from '../images/flower.jpg';
import lemonImg from '../images/lemon.jpg';

const loggedInUser = localStorage.getItem('localUser')

const registerTemplate = document.getElementById("register") as HTMLTemplateElement
const registerTemplateCopy = registerTemplate.content.cloneNode(true) as HTMLElement;

const loginTemplate = document.getElementById("login") as HTMLTemplateElement
const loginTemplateCopy = loginTemplate.content.cloneNode(true) as HTMLElement

const homeTemplate = document.getElementById('home') as HTMLTemplateElement
const homeTemplateCopy = homeTemplate.content.cloneNode(true) as HTMLElement

if (typeof loggedInUser === "string") {
    const parse = JSON.parse(loggedInUser)
    showHomeTemplate()
}

else {
    showLoginTemplate()
}

//register

const contentBox = document.getElementById("content-box") as HTMLDivElement

function showRegisterTemplate() {
    document.body.innerHTML = ''
    document.body.appendChild(registerTemplateCopy)
    const registerBtn = document.getElementById("register-btn") as HTMLButtonElement
    registerBtn.addEventListener('click', registerUser)

}

async function registerUser(event) {
    event.preventDefault()
    const usernameInput = document.getElementById('username-input') as HTMLInputElement
    const passwordInput = document.getElementById('password-input') as HTMLInputElement
    const imgSelect = document.querySelector('input[name="img-choice"]:checked') as HTMLInputElement
    await addUserToFirebase(usernameInput.value.toLowerCase(), passwordInput.value, imgSelect.value)

    if (usernameInput.value === '' || passwordInput.value === '') {
        alert('Both username and password needs to be filled in')
    }

    else if (userAdded === true) {
        location.reload()
    }
    else {
        alert('Username already exists')
    }
}

//login

function showLoginTemplate() {

    document.body.innerHTML = ''
    document.body.appendChild(loginTemplateCopy)

    const loginBtn = document.getElementById("login-btn") as HTMLButtonElement
    loginBtn.addEventListener('click', loginUser)

    const registerLink = document.getElementById("register-link") as HTMLAnchorElement
    registerLink.addEventListener('click', showRegisterTemplate)



}


async function loginUser(event) {
    event.preventDefault()
    let loggedInUser: string
    const usernameInput = document.getElementById('username-input') as HTMLInputElement
    const passwordInput = document.getElementById('password-input') as HTMLInputElement
    const imgSelect = document.getElementById('img-select') as HTMLSelectElement
    await userValidation(usernameInput.value.toLowerCase(), passwordInput.value)

    if (userValidated == true) {
        loggedInUser = usernameInput.value.toLowerCase()
        await getUserImg(usernameInput.value)
        localStorage.setItem("localUser", JSON.stringify(loggedInUser));
        localStorage.setItem("localImg", JSON.stringify(userImg));
        location.reload()
    }
    else {
        alert('Username and password did not match. Please try again')
    }

}


//Home

async function showHomeTemplate() {

    document.body.innerHTML = ''
    document.body.appendChild(homeTemplateCopy)
    const localUser = localStorage.getItem('localUser')
    const localImg = localStorage.getItem('localImg')
    let loggedInUser: string
    let userImg: string


    if (typeof localUser === "string" && typeof localImg === "string") {
        loggedInUser = JSON.parse(localUser)
        userImg = JSON.parse(localImg)





        let imgUrl: any = {}
        const profileImg = document.getElementById('profile-img') as HTMLImageElement
        if (userImg == 'flower') {
            imgUrl = flowerImg
        }
        if (userImg == 'duck') {
            imgUrl = duckImg
        }
        if (userImg == 'lemon') {
            imgUrl = lemonImg
        }


        profileImg.src = imgUrl

    }
    else {
        return
    }
    const usernameHead = document.getElementById('username-head') as HTMLHeadingElement
    usernameHead.innerHTML = loggedInUser
    const homeLink = document.getElementById('home-link') as HTMLButtonElement
    homeLink.addEventListener('click', refresh)
    const memberLink = document.getElementById("member-link") as HTMLAnchorElement
    memberLink.addEventListener('click', showMembers)
    const logoutLink = document.getElementById('logout-link') as HTMLButtonElement
    logoutLink.addEventListener('click', logout)
    showEntries(loggedInUser)

    const entryInput = document.getElementById('entry-input') as HTMLTextAreaElement
    const entryBtn = document.getElementById('entry-btn') as HTMLButtonElement
    entryBtn.addEventListener('click', submitEntry)

    function submitEntry(event) {
        event.preventDefault()
        addEntryToFirebase(loggedInUser, entryInput.value)
        showEntries(loggedInUser)
        entryInput.value = ''
    }

}

async function showEntries(username: string) {
    await getStatusUpdates(username)
    const entryContainer = document.getElementById('entry-container') as HTMLDivElement
    entryContainer.innerHTML = ''
    if (entries == undefined) {
        return
    }

    else {

        for (let i = entries.length - 1; i >= 0; i--) {
            const entryBox = document.createElement('div') as HTMLDivElement
            entryBox.setAttribute('id', 'entry-box')
            entryContainer.append(entryBox)
            const senderP = document.createElement('p') as HTMLParagraphElement
            senderP.setAttribute('id', 'sender-p');
            const entryP = document.createElement('p') as HTMLParagraphElement
            entryP.setAttribute('id', 'entry-p');
            const timestampP = document.createElement('p') as HTMLParagraphElement
            timestampP.setAttribute('id', 'timestamp-p');
            entryBox.append(senderP, entryP, timestampP)
            senderP.innerHTML = username + ':'
            entryP.innerHTML = entries[i][1].entry
            timestampP.innerHTML = '(' + entries[i][1].time + ')'
        }
    }


}

function logout(event) {
    event.preventDefault()
    localStorage.removeItem("localUser");
    localStorage.removeItem("localImg");
    location.reload()
}

function refresh(event) {
    event.preventDefault()
    location.reload()
}

async function showMembers() {
    const contentBox = document.getElementById('four') as HTMLDivElement
    contentBox.innerHTML = ''
    await getMembers()


    for (let i = 0; i < members.length; i++) {

        const memberAnchor = document.createElement('a') as HTMLAnchorElement
        memberAnchor.innerHTML = members[i][0]
        memberAnchor.href = '#'
        memberAnchor.classList.add('member-anchor')
        contentBox.append(memberAnchor)

    }

    const memberAnchors = document.querySelectorAll('a.member-anchor')
    memberAnchors.forEach(button => button.addEventListener("click", async function (event) {
        event.preventDefault()

        const eventTarget = event.target as HTMLButtonElement
        contentBox.innerHTML = ''
        const userH3 = document.createElement('h3') as HTMLHeadingElement
        userH3.innerHTML = eventTarget.innerHTML + '´s status updates'
        contentBox.append(userH3)
        await getStatusUpdates(eventTarget.innerHTML)

        if (entries === null) {
            const messageP = document.createElement('p') as HTMLParagraphElement
            userH3.innerHTML = eventTarget.innerHTML + ' has no status updates'
            contentBox.append(messageP)
        }

        else {
            for (let i = entries.length - 1; i >= 0; i--) {

                const entryBox = document.createElement('div') as HTMLDivElement
                entryBox.setAttribute('id', 'entry-box')
                contentBox.append(entryBox)

                const senderP = document.createElement('p') as HTMLParagraphElement
                senderP.setAttribute('id', 'sender-p');
                const entryP = document.createElement('p') as HTMLParagraphElement
                entryP.setAttribute('id', 'entry-p');
                const timestampP = document.createElement('p') as HTMLParagraphElement
                timestampP.setAttribute('id', 'timestamp-p');
                entryBox.append(senderP, entryP, timestampP)
                senderP.innerHTML = eventTarget.innerHTML + ':'
                entryP.innerHTML = entries[i][1].entry
                timestampP.innerHTML = '(' + entries[i][1].time + ')'

            }
        }
    }))
}