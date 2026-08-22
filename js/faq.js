// ==========================================
// MCH Singen - FAQ Seite
// Zuständig für: Akkordeon-Logik
//
// Die Fragen sind <button>-Elemente (vorher <div> mit Klick-Handler).
// Dadurch kommt die Tastaturbedienung vom Browser: Tab springt hinein,
// Enter und Leertaste lösen aus. aria-expanded sagt Screenreadern, ob die
// Antwort gerade offen ist.
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    const items = document.querySelectorAll('.faq-item');

    function schliessen(item) {
        item.classList.remove('active');
        item.querySelector('.faq-question')?.setAttribute('aria-expanded', 'false');
    }

    items.forEach(item => {
        const frage = item.querySelector('.faq-question');
        if (!frage) return;

        frage.addEventListener('click', () => {
            const warOffen = item.classList.contains('active');
            items.forEach(schliessen);
            if (!warOffen) {
                item.classList.add('active');
                frage.setAttribute('aria-expanded', 'true');
            }
        });
    });
});
