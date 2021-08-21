export const createCard = (): [HTMLDivElement, HTMLDivElement] => {
    const newdiv = document.createElement('div');

    // styling newdiv
    newdiv.style.display = 'inline-block';
    newdiv.style.borderRadius = '2px';
    newdiv.style.padding = '10px';
    newdiv.style.margin = '10px 0px';
    newdiv.style.border = '1px solid rgb(59, 173, 214)';
    newdiv.style.backgroundColor = 'rgba(120, 197, 231, 0.1)';

    const newdivWrapper: HTMLDivElement = document.createElement('div');
    newdivWrapper.appendChild(newdiv);

    return [newdiv, newdivWrapper];
};
