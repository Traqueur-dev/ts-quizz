/**
 * Utilitaires pour manipuler le DOM de manière sécurisée
 */

/**
 * Échappe les caractères HTML pour éviter les injections XSS
 * @param {string} text - Texte à échapper
 * @returns {string} - Texte échappé
 */
export function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Crée un élément DOM avec des attributs et du contenu
 * @param {string} tag - Nom de la balise
 * @param {Object} attributes - Attributs de l'élément
 * @param {string|Node|Node[]} children - Contenu de l'élément
 * @returns {HTMLElement}
 */
export function createElement(tag, attributes = {}, children = null) {
    const element = document.createElement(tag);

    // Appliquer les attributs
    Object.entries(attributes).forEach(([key, value]) => {
        if (key === 'className') {
            element.className = value;
        } else if (key === 'dataset') {
            Object.entries(value).forEach(([dataKey, dataValue]) => {
                element.dataset[dataKey] = dataValue;
            });
        } else if (key.startsWith('on') && typeof value === 'function') {
            element.addEventListener(key.substring(2).toLowerCase(), value);
        } else {
            element.setAttribute(key, value);
        }
    });

    // Ajouter les enfants
    if (children !== null) {
        if (typeof children === 'string') {
            element.textContent = children;
        } else if (Array.isArray(children)) {
            children.forEach(child => {
                if (child instanceof Node) {
                    element.appendChild(child);
                }
            });
        } else if (children instanceof Node) {
            element.appendChild(children);
        }
    }

    return element;
}

/**
 * Nettoie tous les enfants d'un élément
 * @param {HTMLElement} element - Élément à nettoyer
 */
export function clearElement(element) {
    while (element.firstChild) {
        element.removeChild(element.firstChild);
    }
}
