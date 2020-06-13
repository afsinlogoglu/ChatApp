var express=require('express');
var socket=require('socket.io');

//App setup
var prog = express();
var yol = require('path');
var mysql = require('mysql');
var connect = mysql.createConnection({
	host: 'localhost',
	user: 'root',
	password: '',
	database: 'ag_prog_odev'
});
var server = prog.listen(3000,function(){
  console.log('listening to requests on port 3000');
});

//Static files
prog.use(express.static('public'));

//Socket setup
var io= socket(server);

io.on('connection',function(socket){
  socket.on('gonder', function(data){
  		console.log(data + " sisteme giriş yaptı.");
  		var kayit = {kullaniciAd:data, online:1};
  		//sisteme giriş yapan kullanıcı veritabanına kayıt ediliyor.
  		connect.query('insert into kullanici set ?', kayit, function (hata,cevap) {
  			if (!hata) {
  				console.log('Veritabanına kayıt başarılı.');
  				connect.query('Select * from mesaj where kime="herkes"', function (hata, cevap) {
  					io.to(socket.id).emit('tumMesajlar', cevap);
  				});
  			}
  			else{
  				console.log(hata);
  				console.log('Veritabanına kayıt başarısız.');
  			}
  		});

  		//sisteme giriş yapan kullanıcı tüm soketlere bildiriliyor.
  		io.sockets.emit('al', data);
  	});

  	//tüm kullanıcılara mesaj gönderen kullanıcının mesajı alınıyor
  	socket.on('mesaj', function(data){
  		console.log(data);
  		//gönderilen mesajlar veritabanına kayıt ediliyor.
  		var mesaj = {mesaj:data.mesaj, kime: 'herkes' , kimden:data.kimden};
  		connect.query('insert into mesaj set ?', mesaj, function (hata,cevap) {
  			if (!hata) {
  				console.log('Veritabanına kayıt başarılı.');
  			}
  			else{
  				console.log('Veritabanına kayıt başarısız.');
  			}
  		});
  		//sunucuya gönderilen mesaj tüm kullanıcılara yayınlanıyor.
  		io.sockets.emit('mesajAl', data);
  	});

  	//tüm kullanıcılara mesaj gönderen kullanıcının mesajı alınıyor
  	socket.on('mesajGrup', function(data){
  		console.log(data);
  		//gönderilen mesajlar veritabanına kayıt ediliyor.
  		var mesaj = {mesaj:data.mesaj, kime: 'abc' , kimden:data.kimden};
  		connect.query('insert into mesaj set ?', mesaj, function (hata,cevap) {
  			if (!hata) {
  				console.log('Veritabanına kayıt başarılı.');
  			}
  			else{
  				console.log('Veritabanına kayıt başarısız.');
  			}
  		});
  		//sunucuya gönderilen mesaj tüm kullanıcılara yayınlanıyor.
  		socket.broadcast.to('abc').emit('mesajAlGrup', mesaj);
  	});

  	socket.on('odaAc', function (data) {
  		var oda= "abc";
  		console.log(data);
  		console.log('oda aça geldik');
  		socket.join(oda);
  		connect.query('Select * from mesaj where kime="abc"', function (hata, cevap) {
  					io.to(socket.id).emit('grupMesajlar', cevap);
  				});
  		socket.broadcast.to(oda).emit('girdi',data);
  	});


  });

  prog.get("/index.html",function(talep,cevap){
  	cevap.sendFile(yol.join(__dirname + "/index.html"));
  });

  console.log("Sunucu başarıyla aktifleştirildi.");
