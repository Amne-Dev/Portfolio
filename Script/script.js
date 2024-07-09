    
        function loadAnimation() {
            var loader = document.getElementById("loader");
            document.getElementById('loader-logo').style.animation = "blur-out-expand-fwd 1s cubic-bezier(0.250, 0.460, 0.450, 0.940) both";
            document.getElementById('loader').style.animation = "blur-out-expand-fwd 1s cubic-bezier(0.250, 0.460, 0.450, 0.940) 1s both";
    
            window.addEventListener("load", function loaded(){
             
            })
            }   
            function loaded() {
            var loader = document.getElementById("loader");
            loader.style.display = "none";
            window.addEventListener("load", function loaded(){
             
            })
            }
            setTimeout(loadAnimation ,3000 )
            setTimeout(loaded, 5000)
            