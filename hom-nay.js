(function(){var el=document.getElementById('homnay'),D=window.LDC_DAYS;if(!el||!D)return;
var n=new Date(new Date().toLocaleString('en-US',{timeZone:'Asia/Ho_Chi_Minh'})),p=function(x){return(x<10?'0':'')+x},
iso=n.getFullYear()+'-'+p(n.getMonth()+1)+'-'+p(n.getDate()),r=D[iso];if(!r)return;
var up=el.querySelector('a').getAttribute('href'),k=el.getAttribute('data-kind'),
h='<b>Hôm nay</b> '+n.getDate()+'/'+(n.getMonth()+1)+'/'+n.getFullYear()+' · ';
if(k==='tang')h+='lịch Tạng '+r[3]+(r[4]?' · <b>'+r[4]+'</b>':'');
else if(k==='phat')h+='âm lịch '+r[0]+' · Phật lịch '+r[6]+(r[2]?' · <b>'+r[2]+'</b>':'')+(r[5]?' · ngày chay '+r[5]:'');
else h+='âm lịch '+r[0]+' năm '+r[7]+' · ngày '+r[1]+(r[2]?' · <b>'+r[2]+'</b>':'');
el.innerHTML=h+'<br><a href="'+up+'ngay/'+iso+'/">Xem đầy đủ ngày hôm nay</a> · <a href="'+up+'?d='+iso+'">Mở trong ứng dụng</a>';})();
