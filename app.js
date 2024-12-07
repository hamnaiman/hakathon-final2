// Firebase Initialization (with modular SDK)
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.18.0/firebase-app.js"; // Using version 9 for the modular SDK
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.18.0/firebase-auth.js"; // Using Firebase Auth from v9+
import { getDatabase, ref, set, get, remove, update } from "https://www.gstatic.com/firebasejs/9.18.0/firebase-database.js"; // Using Firebase Database from v9+

// Firebase Configuration (Replace with your Firebase credentials)
const firebaseConfig = {
    apiKey: "AIzaSyBRfJSEEcElzLRV8N0z619EmEci3sxjihU",
    authDomain: "blog-hakathon.firebaseapp.com",
    projectId: "blog-hakathon",
    storageBucket: "blog-hakathon.appspot.com",
    messagingSenderId: "442281738727",
    appId: "1:442281738727:web:b252c6eb463fa412627d42",
    measurementId: "G-1WJVY9XQ9Q"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

// Wait for DOM to load before running script
document.addEventListener("DOMContentLoaded", () => {
    // Sign Up Function
    let signUp = () => {
        let email = document.getElementById("email").value;
        let password = document.getElementById("password").value;
        let fullName = document.getElementById("full_name").value;

        // Check for empty inputs (basic validation)
        if (email && password && fullName) {
            createUserWithEmailAndPassword(auth, email, password)
                .then((userCredential) => {
                    const user = userCredential.user;
                    console.log(user);
                    // Redirect to the create post page after successful signup
                    window.location.href = 'create-post.html'; // Redirect to the post creation page
                })
                .catch((error) => {
                    console.log("Sign Up Error: ", error.message);
                    alert("Error: " + error.message); // Optional: display error to user
                });
        } else {
            alert("All fields are required!");
        }
    };

    // Sign In Function
    let signIn = () => {
        let email = document.getElementById("email").value;
        let password = document.getElementById("password").value;

        // Check if email and password are provided
        if (email && password) {
            signInWithEmailAndPassword(auth, email, password)
                .then((userCredential) => {
                    const user = userCredential.user;
                    console.log("User signed in: ", user);

                    // Redirect to the create-post page after successful sign-in
                    window.location.href = 'create-post.html'; // Redirect to the post creation page
                })
                .catch((error) => {
                    console.log("Sign In Error: ", error.message);
                    alert("Error: " + error.message); // Show the error message to the user
                });
        } else {
            alert("Both email and password are required!");
        }
    };

    // Add event listeners
    const signUpButton = document.getElementById("sign_up");
    const signInButton = document.getElementById("sign_in_button");

    if (signUpButton) {
        signUpButton.addEventListener("click", signUp);
    }

    if (signInButton) {
        signInButton.addEventListener("click", signIn);
    }

    // Handle adding new post
    const notify = document.querySelector('.notifiy');
    const add_post_Btn = document.querySelector('#post_btn');

    add_post_Btn.addEventListener('click', () => {
        const title = document.querySelector('#title').value;
        const post_content = document.querySelector('#post_content').value;
        const id = Math.floor(Math.random() * 100);

        if (title && post_content) {
            set(ref(db, 'post/' + id), {
                title: title,
                post_content: post_content
            })
            .then(() => {
                notify.innerHTML = "Data Added Successfully";
                document.querySelector('#title').value = "";
                document.querySelector('#post_content').value = "";
                getPostData(); // Refresh the post list after adding a post
            })
            .catch((error) => {
                notify.innerHTML = "Error: " + error.message;
            });
        } else {
            notify.innerHTML = "Title and content are required!";
        }
    });

    // Get data from Firebase Database and render it
    function getPostData() {
        const user_ref = ref(db, 'post/');
        get(user_ref).then((snapshot) => {
            const data = snapshot.val();
            const table = document.querySelector('table');
            let html = "";

            if (!data) {
                html = "<tr><td colspan='4'>No posts available.</td></tr>";
            } else {
                for (const key in data) {
                    const { title, post_content } = data[key];
                    html += `
                        <tr>
                            <td><span class="postNumber"></span></td>
                            <td>${title}</td>
                            <td><button class="delete" onclick="delete_data('${key}')">Delete</button></td>
                            <td><button class="update" onclick="update_data('${key}')">Update</button></td>
                        </tr>
                    `;
                }
            }

            table.innerHTML = html;
        }).catch((error) => {
            notify.innerHTML = "Error fetching data: " + error.message;
        });
    }

    getPostData(); // Initial data fetch

    // Delete post
    window.delete_data = function(key) {
        remove(ref(db, `post/${key}`))
        .then(() => {
            notify.innerHTML = "Data Deleted Successfully";
            getPostData(); // Refresh the post list after deletion
        })
        .catch((error) => {
            notify.innerHTML = "Error: " + error.message;
        });
    };

    // Update post
    window.update_data = function(key) {
        const user_ref = ref(db, `post/${key}`);
        get(user_ref).then((item) => {
            document.querySelector('#title').value = item.val().title;
            document.querySelector('#post_content').value = item.val().post_content;
        });

        const update_btn = document.querySelector('.update_btn');
        update_btn.classList.add('show');
        document.querySelector('.post_btn').classList.add('hide');

        // Handle update form submission
        update_btn.addEventListener('click', function() {
            const title = document.querySelector('#title').value;
            const post_content = document.querySelector('#post_content').value;

            update(ref(db, `post/${key}`), {
                title: title,
                post_content: post_content
            })
            .then(() => {
                notify.innerHTML = "Data Updated Successfully";
                getPostData(); // Refresh the post list after update
            })
            .catch((error) => {
                notify.innerHTML = "Error: " + error.message;
            });
        });
    };
});
