
document.getElementById('progress').onclick=(e)=>{
 const rect=e.currentTarget.getBoundingClientRect();
 const p=(e.clientX-rect.left)/rect.width;
 audio.currentTime=p*audio.duration;
};
