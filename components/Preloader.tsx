// El script se ejecuta antes del primer pintado: añade .js para las animaciones
// y salta el preloader si ya se vio en esta sesión. La animación en sí es CSS.
const script = `(function(){var d=document.documentElement;d.classList.add('js');try{if(sessionStorage.getItem('ef-preloader')){d.classList.add('preloader-seen')}else{sessionStorage.setItem('ef-preloader','1')}}catch(e){}})();`;

export function Preloader() {
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: script }} />
      <div className="preloader" aria-hidden="true">
        <div className="preloader-logo">
          <img src="/media/brand/logo-full.webp" alt="" width={700} height={460} className="h-full w-full" />
          <div className="preloader-shine" />
        </div>
      </div>
    </>
  );
}
