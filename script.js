class Gauge {
    constructor(_canvas, _size) {
        this.mcanvas = _canvas; // zapamientanie canvas jako sładnika klasy Gauge
        this.mcanvas.width = _size; // ustawienie rozmiaru x canvas
        this.mcanvas.height = _size; // ustawienie rozmiaru y canvas
        this.size = _size; // zapamietanie rozmiaru jako składnik klasy
        this.ctx = this.mcanvas.getContext('2d');
        this.ctx.imageSmoothingEnabled = true;
        this.glass_png = new Image(); //obrazek szkiełka do urzycia zamiast ramki
        this.glass_png.src = "./glass3.png" //obrazek szkiełka ładowanie
        this.initialize_class_filled(); //funkcja inicjalizuje pozostałe pola klasy urzywane w innych metodach
        this.glass_png.onload = () => { //gdy obrazeka się załadue 
            this.draw(); //zaczynamy animacje 
        }


    }
    initialize_class_filled() {
        //inicjalizacja pól i w klasie Gauge
        this.center = { x: this.size / 2, y: this.size / 2 }; //wyliczamy środek canvasa
        this.gauge_level_value = 0; //wartość poziomu zapełnienia na zero
        this.gauge_level_smoth_Value = 0; //animowany poziom zapełnienia również zero
        this.gauge_temp_value = 0; //wartość wskaźnika temperatury na zero
        this.gauge_temp_smoth_Value = 0; //animowany wskaźnik temperatury na zero
    }
    smoth_Value() {
        //funkcja animująca zmiany skokowe na płynne.  Na bazie opisu układu ładowania konsensatora RC
        //zainteresowanych teorią zapraszam na mój stary tutorial 
        //https://www.youtube.com/playlist?list=PL4cOSrndcLNLiYdPD8bUM1EDXMFkRsH2W 
        //Ostatni(trzeci) film z PlayListy to dokładnie ten algorytm.

        //algorytm animacji wartośći poziomu
        this.gauge_level_smoth_Value = (this.gauge_level_value + 100 * this.gauge_level_smoth_Value) / 101;
        //skalowanie 0 do 100% na kąt 0 do PI
        const val1_ZeroToPI = Math.PI * this.gauge_level_smoth_Value / 100;

        //algorytm animacji wartośći temperatury
        this.gauge_temp_smoth_Value = (this.gauge_temp_value + 100 * this.gauge_temp_smoth_Value) / 101;

        //skalowanie 0 do 100% na kąt 0.3[rad] do 0.8*PI[rad]
        const start2 = 0.3; //[radiana]
        const val2_ZeroToPI = start2 + 0.8 * Math.PI * this.gauge_temp_smoth_Value / 100;

        //zwracamy obiekt z obliczonymi granicami do rysowania kształtów 
        return { start: Math.PI / 2 - val1_ZeroToPI, end: Math.PI / 2 + val1_ZeroToPI, start2: Math.PI / 2 + start2, end2: Math.PI / 2 + val2_ZeroToPI };
    }
    update(value, value_temp) {
        //metoda klasy Gauge do uaktualnienia wyświetlanych wartości (nieanimowanych)
        //do urzycia na zwenątrz klasy!!!! (Publiczna gdyby byłą taka możliwość)
        this.gauge_level_value = parseFloat(value);
        this.gauge_temp_value = parseFloat(value_temp);
    }

    //funkcja rysująca kolejne klatki animacji  
    draw() {
        const radius = this.size / 2 * 0.78;
        const radius2 = this.size / 2 * 0.82;

        //wywołanie funkcji "ładowania kondensatora"
        const arcArea = this.smoth_Value(); //funkcja sprawia że wartości skokowe zmieniają się płynnie!!!

        //czyszczenie canvasa
        this.ctx.clearRect(0, 0, this.size, this.size);

        //malowanie napisu - wartość wypełnienia w procentach
        this.ctx.font = "60px Comic Sans MS";
        this.ctx.fillStyle = "rgb(53,140,214)";
        this.ctx.textAlign = "center";
        this.ctx.fillText(this.gauge_level_value + "%", this.center.x, this.center.y + 25);

        //rysowanie wypełnienia poziomu (ARC + fill - stroke)
        this.ctx.fillStyle = "rgba(80,80,80,0.5)";
        this.ctx.beginPath();
        this.ctx.arc(this.center.x, this.center.y, radius, arcArea.start, arcArea.end, false);
        this.ctx.fill();

        //rysowanie wskaźnika temperatury(Arc - fill + stroke)
        this.ctx.beginPath();
        this.ctx.strokeStyle = "#ff0000" //"#Faf60a"
        this.ctx.lineWidth = 18;
        this.ctx.lineCap = 'round';
        this.ctx.arc(this.center.x, this.center.y, radius2, arcArea.start2, arcArea.end2, false);
        this.ctx.stroke();

        //rysowanie obramki Gauga (Arc - fill + stroke)
        //zamiast ramki można użyć obrazku szkiełka który jest zakomentowany poniżej 
        //this.ctx.drawImage(this.glass_png, 0, 0, this.size, this.size); //obrazek szkiełka 
        this.ctx.strokeStyle = "rgba(80,80,80,0.5)";
        this.ctx.beginPath();
        this.ctx.lineWidth = 14;
        this.ctx.arc(this.center.x, this.center.y, radius2, arcArea.start2, 1.25, false);
        this.ctx.stroke();

        //tekst wyświetlacza temperatury
        this.ctx.font = "35px Comic Sans MS";
        this.ctx.fillStyle = "rgb(80, 80, 80)";
        this.ctx.fillText(this.gauge_temp_value + "°C", this.center.x, this.size * 0.97);

        requestAnimationFrame(() => { this.draw(); }); //wywołanie ponownie funkci rysującej (Animacja);
    }
}