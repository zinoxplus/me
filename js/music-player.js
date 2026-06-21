
const tracks=[
{title:'Nothing After',src:'https://raw.githubusercontent.com/zinoxplus/me/main/nothing_after.mp3'},
{title:'eyes in end *R',src:'https://raw.githubusercontent.com/zinoxplus/me/main/LLLH.mp3'},
{title:'Fr-VOID',src:'https://raw.githubusercontent.com/zinoxplus/me/main/lhzzz.mp3'}
];

const audio=document.getElementById('audio');
const playlist=document.getElementById('playlist');
const bar=document.getElementById('bar');
const time=document.getElementById('time');

let current=0;
let repeat=false;

tracks.forEach((t,i)=>{
 const d=document.createElement('div');
 d.className='track';
 d.textContent=t.title;
 d.onclick=()=>loadTrack(i,true);
 playlist.appendChild(d);
});

function loadTrack(i,play=false){
 current=i;
 audio.src=tracks[i].src;
 [...playlist.children].forEach(x=>x.classList.remove('active'));
 playlist.children[i].classList.add('active');
 if(play) audio.play();
}

document.getElementById('play').onclick=()=>{
 if(audio.paused) audio.play(); else audio.pause();
};
document.getElementById('next').onclick=()=>loadTrack((current+1)%tracks.length,true);
document.getElementById('prev').onclick=()=>loadTrack((current-1+tracks.length)%tracks.length,true);

document.getElementById('shuffle').onclick=()=>{
 loadTrack(Math.floor(Math.random()*tracks.length),true);
};

document.getElementById('repeat').onclick=()=>{
 repeat=!repeat;
};

document.getElementById('volume').oninput=e=>audio.volume=e.target.value;

audio.onended=()=>{
 if(repeat){audio.currentTime=0;audio.play();}
 else loadTrack((current+1)%tracks.length,true);
};

audio.ontimeupdate=()=>{
 if(audio.duration){
 bar.style.width=(audio.currentTime/audio.duration*100)+'%';
 time.textContent=Math.floor(audio.currentTime)+' / '+Math.floor(audio.duration);
 }
};

loadTrack(0);
