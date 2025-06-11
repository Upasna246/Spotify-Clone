console.log("let's write javascript");
let currentsong = new Audio();
let songs;
let currFolder;

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');
    return `${formattedMinutes}:${formattedSeconds}`;
}

async function getsongs(folder) {
    currFolder = folder;
    try {
        let response = await fetch("/songs.json");
        if (!response.ok) throw new Error(`Failed to fetch songs.json: ${response.status}`);
        let data = await response.json();
        
        console.log("Fetched data:", data);
        
        if (!data.albums || !Array.isArray(data.albums)) {
            console.error("Invalid data structure: data.albums is not an array");
            return [];
        }
        
        const album = data.albums.find(album => album.folder === folder);
        if (!album) {
            console.error(`Album ${folder} not found in songs.json`);
            return [];
        }
        
        songs = album.songs || [];
        
        let songul = document.querySelector(".songlist ul");
        songul.innerHTML = "";
        for (const song of songs) {
            songul.innerHTML += `<li>
                <img class="invert" width="34" src="img/music.svg" alt="">
                <div class="info">
                    <div>${song.replaceAll("%20", " ")}</div>
                    <div>Harry</div>
                </div>
                <div class="playnow">
                    <span>Play Now</span>
                    <img class="invert" src="img/play.svg" alt="">
                </div>
            </li>`;
        }
        
        Array.from(document.querySelector(".songlist").getElementsByTagName("li")).forEach(e => {
            e.addEventListener("click", () => {
                const track = e.querySelector(".info").firstElementChild.innerHTML.trim();
                playmusic(track);
            });
        });
        
        return songs;
    } catch (error) {
        console.error("Error in getsongs:", error);
        return [];
    }
}

const playmusic = (track, pause = false) => {
    currentsong.src = `/songs/${currFolder}/${track}`;
    if (!pause) {
        currentsong.play();
        document.getElementById("play").src = "img/pause.svg";
    }
    document.querySelector(".songinfo").innerHTML = decodeURI(track);
    document.querySelector(".songtime").innerHTML = "00:00/00:00";
};

async function displayalbum() {
    try {
        let response = await fetch("/songs.json");
        if (!response.ok) throw new Error(`Failed to fetch songs.json: ${response.status}`);
        let data = await response.json();
        
        console.log("Fetched data for albums:", data);
        
        if (!data.albums || !Array.isArray(data.albums)) {
            console.error("Invalid data structure: data.albums is not an array");
            return;
        }
        
        let cardcontainer = document.querySelector(".card-container");
        cardcontainer.innerHTML = "";
        
        for (const album of data.albums) {
            cardcontainer.innerHTML += `<div data-folder="${album.folder}" class="cards">
                <div class="play">
                    <img src="img/playbutton.svg" alt="">
                </div>
                <img src="/songs/${album.folder}/${album.cover}" alt="">
                <h2>${album.title}</h2>
                <p>${album.description}</p>
            </div>`;
        }
        
        Array.from(document.getElementsByClassName("cards")).forEach(e => {
            e.addEventListener("click", async item => {
                songs = await getsongs(item.currentTarget.dataset.folder);
                if (songs.length > 0) playmusic(songs[0]);
            });
        });
    } catch (error) {
        console.error("Error in displayalbum:", error);
    }
}

async function main() {
    songs = await getsongs("Romantic");
    if (songs.length > 0) playmusic(songs[0], true);

    await displayalbum();

    let play = document.getElementById("play");
    play.addEventListener("click", () => {
        if (currentsong.paused) {
            currentsong.play();
            play.src = "img/pause.svg";
        } else {
            currentsong.pause();
            play.src = "img/play.svg";
        }
    });

    currentsong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentsong.currentTime)}/${secondsToMinutesSeconds(currentsong.duration)}`;
        document.querySelector(".circle").style.left = (currentsong.currentTime / currentsong.duration) * 100 + "%";
    });

    document.querySelector(".seekbar").addEventListener("click", (e) => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentsong.currentTime = (currentsong.duration * percent) / 100;
    });

    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
    });

    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%";
    });

    // Fixed Previous button
    document.querySelector("#prev").addEventListener("click", () => {
        let currentFileName = decodeURIComponent(currentsong.src.split("/").slice(-1)[0]);
        let index = songs.indexOf(currentFileName);
        console.log("Previous button: current file =", currentFileName, "index =", index);
        if (index - 1 >= 0) {
            playmusic(songs[index - 1]);
        } else {
            console.log("No previous song available");
            // Optional: Loop to the last song
            // playmusic(songs[songs.length - 1]);
        }
    });

    // Fixed Next button
    document.querySelector("#next").addEventListener("click", () => {
        let currentFileName = decodeURIComponent(currentsong.src.split("/").slice(-1)[0]);
        let index = songs.indexOf(currentFileName);
        console.log("Next button: current file =", currentFileName, "index =", index);
        if (index + 1 < songs.length) {
            playmusic(songs[index + 1]);
        } else {
            console.log("No next song available");
            // Optional: Loop to the first song
            // playmusic(songs[0]);
        }
    });

    document.querySelector(".range input").addEventListener("change", (e) => {
        console.log("setting volume to", e.target.value, "/100");
        currentsong.volume = parseInt(e.target.value) / 100;
    });

    document.querySelector(".volume>img").addEventListener("click", e => {
        if (e.target.src.includes("volume.svg")) {
            e.target.src = e.target.src.replace("volume.svg", "mute.svg");
            currentsong.volume = 0;
            document.querySelector(".range input").value = 0;
        } else {
            e.target.src = e.target.src.replace("mute.svg", "volume.svg");
            currentsong.volume = 0.1;
            document.querySelector(".range input").value = 10;
        }
    });
}

main();