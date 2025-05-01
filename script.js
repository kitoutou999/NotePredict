// Configuration des cookies
function setCookie(name, value, days) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    const expires = "expires=" + date.toUTCString();
    document.cookie = name + "=" + value + ";" + expires + ";path=/";
}

function getCookie(name) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for(let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1);
        if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}

// Gestion des éléments
let elements = JSON.parse(getCookie('elements') || '[]');
let extremeElements = JSON.parse(getCookie('extremeElements') || '[]');
let previousAverage = parseFloat(getCookie('previousAverage') || '10');
let useMaxForProbability = JSON.parse(getCookie('useMaxForProbability') || 'false');

// Fonction pour créer la copie extrême des éléments
function createExtremeElements() {
    extremeElements = JSON.parse(JSON.stringify(elements)); // Deep copy
    extremeElements.forEach(element => {
        element.subjects.forEach(subject => {
            subject.evaluations.forEach(evaluation => {
                if (evaluation.noteMin !== evaluation.noteMax) {
                    evaluation.noteMin = 0;
                }
            });
        });
    });
    setCookie('extremeElements', JSON.stringify(extremeElements), 365);
}

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    // Gestion du formulaire
    const useInterval = document.getElementById('useInterval');
    if (useInterval) {
        useInterval.addEventListener('change', (e) => {
            const singleNoteInput = document.getElementById('singleNoteInput');
            const intervalNoteInput = document.getElementById('intervalNoteInput');
            
            if (e.target.checked) {
                singleNoteInput.style.display = 'none';
                intervalNoteInput.style.display = 'block';
            } else {
                singleNoteInput.style.display = 'block';
                intervalNoteInput.style.display = 'none';
            }
        });
    }

    // Gestion du type d'élément
    document.querySelectorAll('input[name="elementType"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            const subjectForm = document.getElementById('subjectForm');
            const ueForm = document.getElementById('ueForm');
            
            if (e.target.value === 'subject') {
                subjectForm.style.display = 'block';
                ueForm.style.display = 'none';
            } else {
                subjectForm.style.display = 'none';
                ueForm.style.display = 'block';
            }
        });
    });

    // Ajout d'une matière à une UE
    const addUESubject = document.getElementById('addUESubject');
    if (addUESubject) {
        addUESubject.addEventListener('click', () => {
            const subjectForm = document.createElement('div');
            subjectForm.className = 'ue-subject-form mb-3 p-3 border rounded';
            subjectForm.innerHTML = `
                <div class="mb-3">
                    <label class="form-label">Nom de la matière</label>
                    <input type="text" class="form-control ue-subject-name">
                </div>
                <div class="mb-3">
                    <label class="form-label">Coefficient</label>
                    <input type="number" class="form-control ue-subject-coefficient" min="1" value="1">
                </div>
                <div class="mb-3">
                    <div class="form-check form-check-inline">
                        <input class="form-check-input subject-type" type="radio" name="subjectType" value="evaluations" checked>
                        <label class="form-check-label">Ajouter des évaluations</label>
                    </div>
                    <div class="form-check form-check-inline">
                        <input class="form-check-input subject-type" type="radio" name="subjectType" value="global">
                        <label class="form-check-label">Note globale</label>
                    </div>
                </div>
                <div class="evaluations-section">
                    <div class="mb-3">
                        <button type="button" class="btn btn-primary btn-sm add-evaluation">Ajouter une évaluation</button>
                        <div class="evaluations-list mt-3">
                            <!-- Les évaluations seront ajoutées ici -->
                        </div>
                    </div>
                </div>
                <div class="global-note-section" style="display: none;">
                    <div class="mb-3">
                        <div class="form-check mb-2">
                            <input class="form-check-input global-use-interval" type="checkbox">
                            <label class="form-check-label">
                                Utiliser un intervalle de notes
                            </label>
                        </div>
                        <div class="global-single-note mb-3">
                            <label class="form-label">Note</label>
                            <input type="number" class="form-control global-note" min="0" max="20" step="0.1">
                        </div>
                        <div class="global-interval-note mb-3" style="display: none;">
                            <label class="form-label">Intervalle de notes</label>
                            <div class="input-group">
                                <input type="number" class="form-control global-note-min" placeholder="Min" min="0" max="20" step="0.1">
                                <span class="input-group-text">à</span>
                                <input type="number" class="form-control global-note-max" placeholder="Max" min="0" max="20" step="0.1">
                            </div>
                        </div>
                    </div>
                </div>
                <button type="button" class="btn btn-danger btn-sm remove-ue-subject">Supprimer</button>
            `;
            
            // Ajouter le formulaire à l'UE
            const ueSubjects = document.getElementById('ueSubjects');
            if (ueSubjects) {
                ueSubjects.appendChild(subjectForm);
                
                // Gérer le changement de type de matière
                const subjectTypeRadios = subjectForm.querySelectorAll('.subject-type');
                subjectTypeRadios.forEach(radio => {
                    radio.addEventListener('change', (e) => {
                        const evaluationsSection = subjectForm.querySelector('.evaluations-section');
                        const globalNoteSection = subjectForm.querySelector('.global-note-section');
                        
                        if (e.target.value === 'evaluations') {
                            evaluationsSection.style.display = 'block';
                            globalNoteSection.style.display = 'none';
                        } else {
                            evaluationsSection.style.display = 'none';
                            globalNoteSection.style.display = 'block';
                        }
                    });
                });
                
                // Gérer la case à cocher d'intervalle pour la note globale
                const globalUseInterval = subjectForm.querySelector('.global-use-interval');
                globalUseInterval.addEventListener('change', (e) => {
                    const singleNote = subjectForm.querySelector('.global-single-note');
                    const intervalNote = subjectForm.querySelector('.global-interval-note');
                    
                    if (e.target.checked) {
                        singleNote.style.display = 'none';
                        intervalNote.style.display = 'block';
                    } else {
                        singleNote.style.display = 'block';
                        intervalNote.style.display = 'none';
                    }
                });
                
                // Gérer le bouton d'ajout d'évaluation
                const addEvaluationButton = subjectForm.querySelector('.add-evaluation');
                addEvaluationButton.addEventListener('click', () => {
                    const evaluationForm = document.createElement('div');
                    evaluationForm.className = 'evaluation-form mb-3 p-3 border rounded';
                    evaluationForm.innerHTML = `
                        <div class="mb-3">
                            <label class="form-label">Nom de l'évaluation</label>
                            <input type="text" class="form-control evaluation-name">
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Coefficient</label>
                            <input type="number" class="form-control evaluation-coefficient" min="1" value="1">
                        </div>
                        <div class="mb-3">
                            <div class="form-check mb-2">
                                <input class="form-check-input evaluation-use-interval" type="checkbox">
                                <label class="form-check-label">
                                    Utiliser un intervalle de notes
                                </label>
                            </div>
                            <div class="evaluation-single-note mb-3">
                                <label class="form-label">Note</label>
                                <input type="number" class="form-control evaluation-note" min="0" max="20" step="0.1">
                            </div>
                            <div class="evaluation-interval-note mb-3" style="display: none;">
                                <label class="form-label">Intervalle de notes</label>
                                <div class="input-group">
                                    <input type="number" class="form-control evaluation-note-min" placeholder="Min" min="0" max="20" step="0.1">
                                    <span class="input-group-text">à</span>
                                    <input type="number" class="form-control evaluation-note-max" placeholder="Max" min="0" max="20" step="0.1">
                                </div>
                            </div>
                        </div>
                        <button type="button" class="btn btn-danger btn-sm remove-evaluation">Supprimer</button>
                    `;
                    
                    // Ajouter le formulaire à la liste des évaluations
                    const evaluationsList = subjectForm.querySelector('.evaluations-list');
                    if (evaluationsList) {
                        evaluationsList.appendChild(evaluationForm);
                        
                        // Gérer la case à cocher d'intervalle
                        const useIntervalCheckbox = evaluationForm.querySelector('.evaluation-use-interval');
                        useIntervalCheckbox.addEventListener('change', (e) => {
                            const singleNote = evaluationForm.querySelector('.evaluation-single-note');
                            const intervalNote = evaluationForm.querySelector('.evaluation-interval-note');
                            
                            if (e.target.checked) {
                                singleNote.style.display = 'none';
                                intervalNote.style.display = 'block';
                            } else {
                                singleNote.style.display = 'block';
                                intervalNote.style.display = 'none';
                            }
                        });
                        
                        // Gérer le bouton de suppression
                        const removeButton = evaluationForm.querySelector('.remove-evaluation');
                        removeButton.addEventListener('click', () => {
                            evaluationForm.remove();
                        });
                    }
                });
                
                // Gérer le bouton de suppression
                const removeButton = subjectForm.querySelector('.remove-ue-subject');
                removeButton.addEventListener('click', () => {
                    subjectForm.remove();
                });
            }
        });
    }

    // Mise à jour de l'interface
    updateUI();

    document.getElementById('previousAverage').value = previousAverage;
});

// Gestion du mode extrême
let isExtremeMode = false;
const extremeModeButton = document.getElementById('extremeMode');

extremeModeButton.addEventListener('click', () => {
    isExtremeMode = !isExtremeMode;
    extremeModeButton.classList.toggle('active');
    if (isExtremeMode) {
        createExtremeElements();
    }
    updateUI();
});

// Mise à jour de l'interface
function updateUI() {
    const elementsList = document.getElementById('elementsList');
    elementsList.innerHTML = '';
    
    const currentElements = isExtremeMode ? extremeElements : elements;
    
    currentElements.forEach((element, index) => {
        const elementElement = document.createElement('div');
        elementElement.className = 'list-group-item';
        
        // Calcul de la moyenne minimale et maximale pour cette UE
        let ueMinTotal = 0;
        let ueMaxTotal = 0;
        let ueTotalCoefficient = 0;
        
        element.subjects.forEach(subject => {
            let subjectMinTotal = 0;
            let subjectMaxTotal = 0;
            let subjectTotalCoefficient = 0;
            
            subject.evaluations.forEach(evaluation => {
                if (evaluation.noteMin !== null && evaluation.noteMax !== null) {
                    subjectMinTotal += evaluation.noteMin * evaluation.coefficient;
                    subjectMaxTotal += evaluation.noteMax * evaluation.coefficient;
                    subjectTotalCoefficient += evaluation.coefficient;
                }
            });
            
            if (subjectTotalCoefficient > 0) {
                const subjectMinAverage = subjectMinTotal / subjectTotalCoefficient;
                const subjectMaxAverage = subjectMaxTotal / subjectTotalCoefficient;
                
                ueMinTotal += subjectMinAverage * subject.coefficient;
                ueMaxTotal += subjectMaxAverage * subject.coefficient;
                ueTotalCoefficient += subject.coefficient;
            }
        });
        
        let ueAverageText = '';
        if (ueTotalCoefficient > 0) {
            const ueMinAverage = ueMinTotal / ueTotalCoefficient;
            const ueMaxAverage = ueMaxTotal / ueTotalCoefficient;
            ueAverageText = `<span class="ue-average">[${ueMinAverage.toFixed(2)} - ${ueMaxAverage.toFixed(2)}]</span>`;
        }
        
        let subjectsHtml = '';
        element.subjects.forEach((subject, subIndex) => {
            let subjectHtml = '';
            
            if (subject.evaluations && subject.evaluations.length === 1) {
                // Si une seule évaluation, afficher directement la note à la matière
                const evaluation = subject.evaluations[0];
                subjectHtml = `
                    <div class="ms-3 mb-2">
                        <div class="d-flex justify-content-between align-items-center">
                            <div>
                                <strong contenteditable="true" data-type="subject-name" data-ue-index="${index}" data-subject-index="${subIndex}">${subject.name}</strong> 
                                (Coeff: <span contenteditable="true" data-type="subject-coefficient" data-ue-index="${index}" data-subject-index="${subIndex}">${subject.coefficient}</span>)<br>
                                Note: <span contenteditable="true" data-type="evaluation-note" data-ue-index="${index}" data-subject-index="${subIndex}" data-eval-index="0">${evaluation.noteMin !== null ? evaluation.noteMin : '?'}</span>
                                ${evaluation.noteMax !== null && evaluation.noteMax !== evaluation.noteMin ? 
                                    `à <span contenteditable="true" data-type="evaluation-note-max" data-ue-index="${index}" data-subject-index="${subIndex}" data-eval-index="0">${evaluation.noteMax}</span>` : ''}
                            </div>
                        </div>
                    </div>
                `;
            } else {
                // Si plusieurs évaluations, afficher le détail
                let evaluationsHtml = '';
                if (subject.evaluations && subject.evaluations.length > 0) {
                    evaluationsHtml = '<div class="ms-3 mt-2">';
                    subject.evaluations.forEach((evaluation, evalIndex) => {
                        evaluationsHtml += `
                            <div class="mb-2">
                                <div class="d-flex justify-content-between align-items-center">
                                    <div>
                                        <strong contenteditable="true" data-type="evaluation-name" data-ue-index="${index}" data-subject-index="${subIndex}" data-eval-index="${evalIndex}">${evaluation.name}</strong> 
                                        (Coeff: <span contenteditable="true" data-type="evaluation-coefficient" data-ue-index="${index}" data-subject-index="${subIndex}" data-eval-index="${evalIndex}">${evaluation.coefficient}</span>)<br>
                                        Note: <span contenteditable="true" data-type="evaluation-note" data-ue-index="${index}" data-subject-index="${subIndex}" data-eval-index="${evalIndex}">${evaluation.noteMin !== null ? evaluation.noteMin : '?'}</span>
                                        ${evaluation.noteMax !== null && evaluation.noteMax !== evaluation.noteMin ? 
                                            `à <span contenteditable="true" data-type="evaluation-note-max" data-ue-index="${index}" data-subject-index="${subIndex}" data-eval-index="${evalIndex}">${evaluation.noteMax}</span>` : ''}
                                    </div>
                                </div>
                            </div>
                        `;
                    });
                    evaluationsHtml += '</div>';
                }
                
                subjectHtml = `
                    <div class="ms-3 mb-2">
                        <div class="d-flex justify-content-between align-items-center">
                            <div>
                                <strong contenteditable="true" data-type="subject-name" data-ue-index="${index}" data-subject-index="${subIndex}">${subject.name}</strong> 
                                (Coeff: <span contenteditable="true" data-type="subject-coefficient" data-ue-index="${index}" data-subject-index="${subIndex}">${subject.coefficient}</span>)<br>
                                ${evaluationsHtml}
                            </div>
                        </div>
                    </div>
                `;
            }
            
            subjectsHtml += subjectHtml;
        });
        
        elementElement.innerHTML = `
            <div class="subject-info">
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <strong contenteditable="true" data-type="ue-name" data-ue-index="${index}">${element.name}</strong> 
                        (Coeff: <span contenteditable="true" data-type="ue-coefficient" data-ue-index="${index}">${element.coefficient}</span>)
                    </div>
                    <div class="ue-average-container">
                        ${ueAverageText}
                        <div class="ue-actions">
                            <button type="button" class="btn btn-secondary btn-sm edit-ue" data-ue-index="${index}">
                                <i class="bi bi-pencil"></i>
                            </button>
                            <button type="button" class="btn btn-danger btn-sm remove-ue" data-ue-index="${index}">
                                <i class="bi bi-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
                ${subjectsHtml}
            </div>
        `;
        
        elementsList.appendChild(elementElement);
    });
    
    // Ajouter les gestionnaires d'événements pour les éléments modifiables
    document.querySelectorAll('[contenteditable="true"]').forEach(element => {
        element.addEventListener('blur', (e) => {
            const type = e.target.dataset.type;
            const ueIndex = parseInt(e.target.dataset.ueIndex);
            const subjectIndex = e.target.dataset.subjectIndex ? parseInt(e.target.dataset.subjectIndex) : null;
            const evalIndex = e.target.dataset.evalIndex ? parseInt(e.target.dataset.evalIndex) : null;
            
            let value = e.target.textContent.trim();
            
            // Conversion des valeurs numériques
            if (type.includes('coefficient') || type.includes('note')) {
                value = parseFloat(value);
                if (isNaN(value)) {
                    e.target.textContent = e.target.dataset.originalValue;
                    return;
                }
            }
            
            // Mise à jour des données
            const targetElements = isExtremeMode ? extremeElements : elements;
            
            switch(type) {
                case 'ue-name':
                    targetElements[ueIndex].name = value;
                    break;
                case 'ue-coefficient':
                    targetElements[ueIndex].coefficient = value;
                    break;
                case 'subject-name':
                    targetElements[ueIndex].subjects[subjectIndex].name = value;
                    break;
                case 'subject-coefficient':
                    targetElements[ueIndex].subjects[subjectIndex].coefficient = value;
                    break;
                case 'evaluation-name':
                    targetElements[ueIndex].subjects[subjectIndex].evaluations[evalIndex].name = value;
                    break;
                case 'evaluation-coefficient':
                    targetElements[ueIndex].subjects[subjectIndex].evaluations[evalIndex].coefficient = value;
                    break;
                case 'evaluation-note':
                    // Ne pas écraser la note maximale si elle existe et est différente
                    if (targetElements[ueIndex].subjects[subjectIndex].evaluations[evalIndex].noteMax !== null && 
                        targetElements[ueIndex].subjects[subjectIndex].evaluations[evalIndex].noteMax !== targetElements[ueIndex].subjects[subjectIndex].evaluations[evalIndex].noteMin) {
                        targetElements[ueIndex].subjects[subjectIndex].evaluations[evalIndex].noteMin = value;
                    } else {
                        targetElements[ueIndex].subjects[subjectIndex].evaluations[evalIndex].noteMin = value;
                        targetElements[ueIndex].subjects[subjectIndex].evaluations[evalIndex].noteMax = value;
                    }
                    break;
                case 'evaluation-note-max':
                    targetElements[ueIndex].subjects[subjectIndex].evaluations[evalIndex].noteMax = value;
                    break;
            }
            
            // Sauvegarder les modifications
            if (isExtremeMode) {
                setCookie('extremeElements', JSON.stringify(extremeElements), 365);
            } else {
                setCookie('elements', JSON.stringify(elements), 365);
            }
            updateUI();
        });

        // Empêcher le saut de ligne et valider avec Entrée
        element.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                e.target.blur();
            }
        });
        
        // Sauvegarder la valeur originale pour la restauration en cas d'erreur
        element.dataset.originalValue = element.textContent;
    });
    
    // Ajouter les gestionnaires d'événements pour les boutons de suppression
    document.querySelectorAll('.remove-ue').forEach(button => {
        button.addEventListener('click', (e) => {
            const ueIndex = e.target.closest('.remove-ue').dataset.ueIndex;
            removeUE(ueIndex);
        });
    });
    
    // Ajouter les gestionnaires d'événements pour les boutons
    document.querySelectorAll('.edit-ue').forEach(button => {
        button.addEventListener('click', (e) => {
            const ueIndex = e.target.closest('.edit-ue').dataset.ueIndex;
            editUE(ueIndex);
        });
    });
    
    // Mettre à jour l'état du switch de probabilité
    const probabilitySwitch = document.getElementById('probabilitySwitch');
    if (probabilitySwitch) {
        probabilitySwitch.checked = useMaxForProbability;
    }
    
    updatePredictions();
}

// Fonctions pour modifier les éléments
function editUE(ueIndex) {
    const ue = elements[ueIndex];
    
    // Sauvegarder l'index de l'UE en cours de modification
    document.getElementById('ueName').dataset.editingIndex = ueIndex;
    document.getElementById('ueName').value = ue.name;
    document.getElementById('ueCoefficient').value = ue.coefficient;
    
    // Créer les formulaires de matières
    const ueSubjects = document.getElementById('ueSubjects');
    ueSubjects.innerHTML = '';
    
    ue.subjects.forEach((subject, subjectIndex) => {
        const subjectForm = document.createElement('div');
        subjectForm.className = 'ue-subject-form mb-3 p-3 border rounded';
        subjectForm.innerHTML = `
            <div class="mb-3">
                <label class="form-label">Nom de la matière</label>
                <input type="text" class="form-control ue-subject-name" value="${subject.name}">
            </div>
            <div class="mb-3">
                <label class="form-label">Coefficient</label>
                <input type="number" class="form-control ue-subject-coefficient" min="1" value="${subject.coefficient}">
            </div>
            <div class="mb-3">
                <div class="form-check form-check-inline">
                    <input class="form-check-input subject-type" type="radio" name="subjectType" value="evaluations" ${subject.evaluations.length > 1 ? 'checked' : ''}>
                    <label class="form-check-label">Ajouter des évaluations</label>
                </div>
                <div class="form-check form-check-inline">
                    <input class="form-check-input subject-type" type="radio" name="subjectType" value="global" ${subject.evaluations.length === 1 ? 'checked' : ''}>
                    <label class="form-check-label">Note globale</label>
                </div>
            </div>
            <div class="evaluations-section" style="display: ${subject.evaluations.length > 1 ? 'block' : 'none'}">
                <div class="mb-3">
                    <button type="button" class="btn btn-primary btn-sm add-evaluation">Ajouter une évaluation</button>
                    <div class="evaluations-list mt-3">
                        ${subject.evaluations.map((evaluation, index) => `
                            <div class="evaluation-form mb-3 p-3 border rounded">
                                <div class="mb-3">
                                    <label class="form-label">Nom de l'évaluation</label>
                                    <input type="text" class="form-control evaluation-name" value="${evaluation.name}">
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">Coefficient</label>
                                    <input type="number" class="form-control evaluation-coefficient" min="1" value="${evaluation.coefficient}">
                                </div>
                                <div class="mb-3">
                                    <div class="form-check mb-2">
                                        <input class="form-check-input evaluation-use-interval" type="checkbox" ${evaluation.noteMin !== evaluation.noteMax ? 'checked' : ''}>
                                        <label class="form-check-label">
                                            Utiliser un intervalle de notes
                                        </label>
                                    </div>
                                    <div class="evaluation-single-note mb-3" style="display: ${evaluation.noteMin === evaluation.noteMax ? 'block' : 'none'}">
                                        <label class="form-label">Note</label>
                                        <input type="number" class="form-control evaluation-note" min="0" max="20" step="0.1" value="${evaluation.noteMin}">
                                    </div>
                                    <div class="evaluation-interval-note mb-3" style="display: ${evaluation.noteMin !== evaluation.noteMax ? 'block' : 'none'}">
                                        <label class="form-label">Intervalle de notes</label>
                                        <div class="input-group">
                                            <input type="number" class="form-control evaluation-note-min" placeholder="Min" min="0" max="20" step="0.1" value="${evaluation.noteMin}">
                                            <span class="input-group-text">à</span>
                                            <input type="number" class="form-control evaluation-note-max" placeholder="Max" min="0" max="20" step="0.1" value="${evaluation.noteMax}">
                                        </div>
                                    </div>
                                </div>
                                <button type="button" class="btn btn-danger btn-sm remove-evaluation">Supprimer</button>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
            <div class="global-note-section" style="display: ${subject.evaluations.length === 1 ? 'block' : 'none'}">
                <div class="mb-3">
                    <div class="form-check mb-2">
                        <input class="form-check-input global-use-interval" type="checkbox" ${subject.evaluations[0].noteMin !== subject.evaluations[0].noteMax ? 'checked' : ''}>
                        <label class="form-check-label">
                            Utiliser un intervalle de notes
                        </label>
                    </div>
                    <div class="global-single-note mb-3" style="display: ${subject.evaluations[0].noteMin === subject.evaluations[0].noteMax ? 'block' : 'none'}">
                        <label class="form-label">Note</label>
                        <input type="number" class="form-control global-note" min="0" max="20" step="0.1" value="${subject.evaluations[0].noteMin}">
                    </div>
                    <div class="global-interval-note mb-3" style="display: ${subject.evaluations[0].noteMin !== subject.evaluations[0].noteMax ? 'block' : 'none'}">
                        <label class="form-label">Intervalle de notes</label>
                        <div class="input-group">
                            <input type="number" class="form-control global-note-min" placeholder="Min" min="0" max="20" step="0.1" value="${subject.evaluations[0].noteMin}">
                            <span class="input-group-text">à</span>
                            <input type="number" class="form-control global-note-max" placeholder="Max" min="0" max="20" step="0.1" value="${subject.evaluations[0].noteMax}">
                        </div>
                    </div>
                </div>
            </div>
            <button type="button" class="btn btn-danger btn-sm remove-ue-subject">Supprimer</button>
        `;
        
        ueSubjects.appendChild(subjectForm);
        
        // Gérer le changement de type de matière
        const subjectTypeRadios = subjectForm.querySelectorAll('.subject-type');
        subjectTypeRadios.forEach(radio => {
            radio.addEventListener('change', (e) => {
                const evaluationsSection = subjectForm.querySelector('.evaluations-section');
                const globalNoteSection = subjectForm.querySelector('.global-note-section');
                
                if (e.target.value === 'evaluations') {
                    evaluationsSection.style.display = 'block';
                    globalNoteSection.style.display = 'none';
                } else {
                    evaluationsSection.style.display = 'none';
                    globalNoteSection.style.display = 'block';
                }
            });
        });
        
        // Gérer la case à cocher d'intervalle pour la note globale
        const globalUseInterval = subjectForm.querySelector('.global-use-interval');
        globalUseInterval.addEventListener('change', (e) => {
            const singleNote = subjectForm.querySelector('.global-single-note');
            const intervalNote = subjectForm.querySelector('.global-interval-note');
            
            if (e.target.checked) {
                singleNote.style.display = 'none';
                intervalNote.style.display = 'block';
            } else {
                singleNote.style.display = 'block';
                intervalNote.style.display = 'none';
            }
        });
        
        // Gérer le bouton d'ajout d'évaluation
        const addEvaluationButton = subjectForm.querySelector('.add-evaluation');
        addEvaluationButton.addEventListener('click', () => {
            const evaluationForm = document.createElement('div');
            evaluationForm.className = 'evaluation-form mb-3 p-3 border rounded';
            evaluationForm.innerHTML = `
                <div class="mb-3">
                    <label class="form-label">Nom de l'évaluation</label>
                    <input type="text" class="form-control evaluation-name">
                </div>
                <div class="mb-3">
                    <label class="form-label">Coefficient</label>
                    <input type="number" class="form-control evaluation-coefficient" min="1" value="1">
                </div>
                <div class="mb-3">
                    <div class="form-check mb-2">
                        <input class="form-check-input evaluation-use-interval" type="checkbox">
                        <label class="form-check-label">
                            Utiliser un intervalle de notes
                        </label>
                    </div>
                    <div class="evaluation-single-note mb-3">
                        <label class="form-label">Note</label>
                        <input type="number" class="form-control evaluation-note" min="0" max="20" step="0.1">
                    </div>
                    <div class="evaluation-interval-note mb-3" style="display: none;">
                        <label class="form-label">Intervalle de notes</label>
                        <div class="input-group">
                            <input type="number" class="form-control evaluation-note-min" placeholder="Min" min="0" max="20" step="0.1">
                            <span class="input-group-text">à</span>
                            <input type="number" class="form-control evaluation-note-max" placeholder="Max" min="0" max="20" step="0.1">
                        </div>
                    </div>
                </div>
                <button type="button" class="btn btn-danger btn-sm remove-evaluation">Supprimer</button>
            `;
            
            // Ajouter le formulaire à la liste des évaluations
            const evaluationsList = subjectForm.querySelector('.evaluations-list');
            if (evaluationsList) {
                evaluationsList.appendChild(evaluationForm);
                
                // Gérer la case à cocher d'intervalle
                const useIntervalCheckbox = evaluationForm.querySelector('.evaluation-use-interval');
                useIntervalCheckbox.addEventListener('change', (e) => {
                    const singleNote = evaluationForm.querySelector('.evaluation-single-note');
                    const intervalNote = evaluationForm.querySelector('.evaluation-interval-note');
                    
                    if (e.target.checked) {
                        singleNote.style.display = 'none';
                        intervalNote.style.display = 'block';
                    } else {
                        singleNote.style.display = 'block';
                        intervalNote.style.display = 'none';
                    }
                });
                
                // Gérer le bouton de suppression
                const removeButton = evaluationForm.querySelector('.remove-evaluation');
                removeButton.addEventListener('click', () => {
                    evaluationForm.remove();
                });
            }
        });
        
        // Gérer le bouton de suppression
        const removeButton = subjectForm.querySelector('.remove-ue-subject');
        removeButton.addEventListener('click', () => {
            subjectForm.remove();
        });
    });
}

function removeUE(ueIndex) {
    elements.splice(ueIndex, 1);
    setCookie('elements', JSON.stringify(elements), 365);
    updateUI();
}

function editSubject(ueIndex, subjectIndex) {
    const subject = elements[ueIndex].subjects[subjectIndex];
    
    // Créer un nouveau formulaire de matière
    const subjectForm = document.createElement('div');
    subjectForm.className = 'ue-subject-form mb-3 p-3 border rounded';
    subjectForm.innerHTML = `
        <div class="mb-3">
            <label class="form-label">Nom de la matière</label>
            <input type="text" class="form-control ue-subject-name" value="${subject.name}">
        </div>
        <div class="mb-3">
            <label class="form-label">Coefficient</label>
            <input type="number" class="form-control ue-subject-coefficient" min="1" value="${subject.coefficient}">
        </div>
        <div class="mb-3">
            <div class="form-check form-check-inline">
                <input class="form-check-input subject-type" type="radio" name="subjectType" value="evaluations" ${subject.evaluations.length > 1 ? 'checked' : ''}>
                <label class="form-check-label">Ajouter des évaluations</label>
            </div>
            <div class="form-check form-check-inline">
                <input class="form-check-input subject-type" type="radio" name="subjectType" value="global" ${subject.evaluations.length === 1 ? 'checked' : ''}>
                <label class="form-check-label">Note globale</label>
            </div>
        </div>
        <div class="evaluations-section" style="display: ${subject.evaluations.length > 1 ? 'block' : 'none'}">
            <div class="mb-3">
                <button type="button" class="btn btn-primary btn-sm add-evaluation">Ajouter une évaluation</button>
                <div class="evaluations-list mt-3">
                    ${subject.evaluations.map((evaluation, index) => `
                        <div class="evaluation-form mb-3 p-3 border rounded">
                            <div class="mb-3">
                                <label class="form-label">Nom de l'évaluation</label>
                                <input type="text" class="form-control evaluation-name" value="${evaluation.name}">
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Coefficient</label>
                                <input type="number" class="form-control evaluation-coefficient" min="1" value="${evaluation.coefficient}">
                            </div>
                            <div class="mb-3">
                                <div class="form-check mb-2">
                                    <input class="form-check-input evaluation-use-interval" type="checkbox" ${evaluation.noteMin !== evaluation.noteMax ? 'checked' : ''}>
                                    <label class="form-check-label">
                                        Utiliser un intervalle de notes
                                    </label>
                                </div>
                                <div class="evaluation-single-note mb-3" style="display: ${evaluation.noteMin === evaluation.noteMax ? 'block' : 'none'}">
                                    <label class="form-label">Note</label>
                                    <input type="number" class="form-control evaluation-note" min="0" max="20" step="0.1" value="${evaluation.noteMin}">
                                </div>
                                <div class="evaluation-interval-note mb-3" style="display: ${evaluation.noteMin !== evaluation.noteMax ? 'block' : 'none'}">
                                    <label class="form-label">Intervalle de notes</label>
                                    <div class="input-group">
                                        <input type="number" class="form-control evaluation-note-min" placeholder="Min" min="0" max="20" step="0.1" value="${evaluation.noteMin}">
                                        <span class="input-group-text">à</span>
                                        <input type="number" class="form-control evaluation-note-max" placeholder="Max" min="0" max="20" step="0.1" value="${evaluation.noteMax}">
                                    </div>
                                </div>
                            </div>
                            <button type="button" class="btn btn-danger btn-sm remove-evaluation">Supprimer</button>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
        <div class="global-note-section" style="display: ${subject.evaluations.length === 1 ? 'block' : 'none'}">
            <div class="mb-3">
                <div class="form-check mb-2">
                    <input class="form-check-input global-use-interval" type="checkbox" ${subject.evaluations[0].noteMin !== subject.evaluations[0].noteMax ? 'checked' : ''}>
                    <label class="form-check-label">
                        Utiliser un intervalle de notes
                    </label>
                </div>
                <div class="global-single-note mb-3" style="display: ${subject.evaluations[0].noteMin === subject.evaluations[0].noteMax ? 'block' : 'none'}">
                    <label class="form-label">Note</label>
                    <input type="number" class="form-control global-note" min="0" max="20" step="0.1" value="${subject.evaluations[0].noteMin}">
                </div>
                <div class="global-interval-note mb-3" style="display: ${subject.evaluations[0].noteMin !== subject.evaluations[0].noteMax ? 'block' : 'none'}">
                    <label class="form-label">Intervalle de notes</label>
                    <div class="input-group">
                        <input type="number" class="form-control global-note-min" placeholder="Min" min="0" max="20" step="0.1" value="${subject.evaluations[0].noteMin}">
                        <span class="input-group-text">à</span>
                        <input type="number" class="form-control global-note-max" placeholder="Max" min="0" max="20" step="0.1" value="${subject.evaluations[0].noteMax}">
                    </div>
                </div>
            </div>
        </div>
        <button type="button" class="btn btn-danger btn-sm remove-ue-subject">Supprimer</button>
    `;
    
    // Supprimer la matière actuelle
    elements[ueIndex].subjects.splice(subjectIndex, 1);
    setCookie('elements', JSON.stringify(elements), 365);
    
    // Ajouter le formulaire à l'UE
    const ueSubjects = document.getElementById('ueSubjects');
    ueSubjects.innerHTML = '';
    ueSubjects.appendChild(subjectForm);
    
    // Mettre à jour l'interface
    updateUI();
}

function removeSubject(ueIndex, subjectIndex) {
    elements[ueIndex].subjects.splice(subjectIndex, 1);
    setCookie('elements', JSON.stringify(elements), 365);
    updateUI();
}

function editEvaluation(ueIndex, subjectIndex, evalIndex) {
    const evaluation = elements[ueIndex].subjects[subjectIndex].evaluations[evalIndex];
    
    // Créer un nouveau formulaire d'évaluation
    const evaluationForm = document.createElement('div');
    evaluationForm.className = 'evaluation-form mb-3 p-3 border rounded';
    evaluationForm.innerHTML = `
        <div class="mb-3">
            <label class="form-label">Nom de l'évaluation</label>
            <input type="text" class="form-control evaluation-name" value="${evaluation.name}">
        </div>
        <div class="mb-3">
            <label class="form-label">Coefficient</label>
            <input type="number" class="form-control evaluation-coefficient" min="1" value="${evaluation.coefficient}">
        </div>
        <div class="mb-3">
            <div class="form-check mb-2">
                <input class="form-check-input evaluation-use-interval" type="checkbox" ${evaluation.noteMin !== evaluation.noteMax ? 'checked' : ''}>
                <label class="form-check-label">
                    Utiliser un intervalle de notes
                </label>
            </div>
            <div class="evaluation-single-note mb-3" style="display: ${evaluation.noteMin === evaluation.noteMax ? 'block' : 'none'}">
                <label class="form-label">Note</label>
                <input type="number" class="form-control evaluation-note" min="0" max="20" step="0.1" value="${evaluation.noteMin}">
            </div>
            <div class="evaluation-interval-note mb-3" style="display: ${evaluation.noteMin !== evaluation.noteMax ? 'block' : 'none'}">
                <label class="form-label">Intervalle de notes</label>
                <div class="input-group">
                    <input type="number" class="form-control evaluation-note-min" placeholder="Min" min="0" max="20" step="0.1" value="${evaluation.noteMin}">
                    <span class="input-group-text">à</span>
                    <input type="number" class="form-control evaluation-note-max" placeholder="Max" min="0" max="20" step="0.1" value="${evaluation.noteMax}">
                </div>
            </div>
        </div>
        <button type="button" class="btn btn-danger btn-sm remove-evaluation">Supprimer</button>
    `;
    
    // Ajouter le formulaire à la matière existante
    const ueSubjects = document.getElementById('ueSubjects');
    const subjectForm = ueSubjects.querySelector('.ue-subject-form');
    
    if (subjectForm) {
        const evaluationsList = subjectForm.querySelector('.evaluations-list');
        if (evaluationsList) {
            // Supprimer l'ancienne évaluation du DOM
            const oldEvaluationForm = evaluationsList.querySelector(`[data-eval-index="${evalIndex}"]`);
            if (oldEvaluationForm) {
                oldEvaluationForm.remove();
            }
            
            // Ajouter le nouveau formulaire
            evaluationForm.dataset.evalIndex = evalIndex;
            evaluationsList.appendChild(evaluationForm);
            
            // Ajouter les gestionnaires d'événements
            const useIntervalCheckbox = evaluationForm.querySelector('.evaluation-use-interval');
            useIntervalCheckbox.addEventListener('change', (e) => {
                const singleNote = evaluationForm.querySelector('.evaluation-single-note');
                const intervalNote = evaluationForm.querySelector('.evaluation-interval-note');
                
                if (e.target.checked) {
                    singleNote.style.display = 'none';
                    intervalNote.style.display = 'block';
                } else {
                    singleNote.style.display = 'block';
                    intervalNote.style.display = 'none';
                }
            });
            
            // Gérer le bouton de suppression
            const removeButton = evaluationForm.querySelector('.remove-evaluation');
            removeButton.addEventListener('click', () => {
                evaluationForm.remove();
                elements[ueIndex].subjects[subjectIndex].evaluations.splice(evalIndex, 1);
                setCookie('elements', JSON.stringify(elements), 365);
                updateUI();
            });
        }
    }
    
    // Mettre à jour l'interface
    updateUI();
}

function removeEvaluation(ueIndex, subjectIndex, evalIndex) {
    elements[ueIndex].subjects[subjectIndex].evaluations.splice(evalIndex, 1);
    setCookie('elements', JSON.stringify(elements), 365);
    updateUI();
}

// Mise à jour de la moyenne précédente
document.getElementById('previousAverage').addEventListener('change', (e) => {
    previousAverage = parseFloat(e.target.value) || 10;
    setCookie('previousAverage', previousAverage, 365);
    updatePredictions();
});

// Calcul des prédictions
function updatePredictions() {
    let totalCoefficient = 0;
    let minTotal = 0;
    let maxTotal = 0;
    
    const currentElements = isExtremeMode ? extremeElements : elements;
    
    currentElements.forEach(element => {
        if (element.type === 'ue') {
            let ueMinTotal = 0;
            let ueMaxTotal = 0;
            let ueTotalCoefficient = 0;
            
            element.subjects.forEach(subject => {
                let subjectMinTotal = 0;
                let subjectMaxTotal = 0;
                let subjectTotalCoefficient = 0;
                
                subject.evaluations.forEach(evaluation => {
                    if (evaluation.noteMin !== null && evaluation.noteMax !== null) {
                        subjectMinTotal += evaluation.noteMin * evaluation.coefficient;
                        subjectMaxTotal += evaluation.noteMax * evaluation.coefficient;
                        subjectTotalCoefficient += evaluation.coefficient;
                    }
                });
                
                if (subjectTotalCoefficient > 0) {
                    const subjectMinAverage = subjectMinTotal / subjectTotalCoefficient;
                    const subjectMaxAverage = subjectMaxTotal / subjectTotalCoefficient;
                    
                    ueMinTotal += subjectMinAverage * subject.coefficient;
                    ueMaxTotal += subjectMaxAverage * subject.coefficient;
                    ueTotalCoefficient += subject.coefficient;
                }
            });
            
            if (ueTotalCoefficient > 0) {
                const ueMinAverage = ueMinTotal / ueTotalCoefficient;
                const ueMaxAverage = ueMaxTotal / ueTotalCoefficient;
                
                minTotal += ueMinAverage * element.coefficient;
                maxTotal += ueMaxAverage * element.coefficient;
                totalCoefficient += element.coefficient;
            }
        }
    });
    
    let minAverage = 0;
    let maxAverage = 0;
    let successProbability = 0;

    if (totalCoefficient > 0) {
        minAverage = minTotal / totalCoefficient;
        maxAverage = maxTotal / totalCoefficient;
        
        if (useMaxForProbability) {
            // Calcul de la probabilité pour le semestre uniquement
            if (minAverage >= 10) {
                successProbability = 100;
            } else if (maxAverage < 10) {
                successProbability = 0;
            } else {
                const range = maxAverage - minAverage;
                const position = (10 - minAverage) / range;
                successProbability = (1 - position) * 100;
            }
        } else {
            // Calcul de la probabilité pour l'année
            const minAnnualAverage = (previousAverage + minAverage) / 2;
            const maxAnnualAverage = (previousAverage + maxAverage) / 2;
            
            if (minAnnualAverage >= 10) {
                successProbability = 100;
            } else if (maxAnnualAverage < 10) {
                successProbability = 0;
            } else {
                // Pour avoir la moyenne sur l'année, il faut compenser la moyenne du semestre précédent
                // Si previousAverage < 10, il faut une moyenne plus élevée au second semestre
                // Si previousAverage > 10, on peut se permettre une moyenne plus basse
                const neededAverage = 2 * 10 - previousAverage;
                const range = maxAverage - minAverage;
                const position = (neededAverage - minAverage) / range;
                successProbability = (1 - position) * 100;
            }
        }
    }

    // Mise à jour de l'interface
    document.getElementById('minAverage').textContent = minAverage.toFixed(2);
    document.getElementById('maxAverage').textContent = maxAverage.toFixed(2);
    document.getElementById('successProbability').textContent = `${successProbability.toFixed(1)}%`;
}

// Gestion du switch de probabilité
document.getElementById('probabilitySwitch').addEventListener('change', (e) => {
    useMaxForProbability = e.target.checked;
    setCookie('useMaxForProbability', useMaxForProbability, 365);
    updatePredictions();
});

// Ajout d'un élément
document.getElementById('addElement').addEventListener('click', () => {
    const name = document.getElementById('ueName').value;
    const coefficient = parseInt(document.getElementById('ueCoefficient').value);
    const editingIndex = document.getElementById('ueName').dataset.editingIndex;
    
    if (name && coefficient > 0) {
        // Récupérer les matières de l'UE
        const subjects = [];
        const subjectForms = document.querySelectorAll('.ue-subject-form');
        subjectForms.forEach(form => {
            const subjectName = form.querySelector('.ue-subject-name').value;
            const subjectCoefficient = parseInt(form.querySelector('.ue-subject-coefficient').value);
            const subjectType = form.querySelector('input[name="subjectType"]:checked').value;
            
            // Récupérer les évaluations de la matière
            const evaluations = [];
            
            if (subjectType === 'evaluations') {
                // Mode évaluations multiples
                const evaluationForms = form.querySelectorAll('.evaluation-form');
                evaluationForms.forEach(evalForm => {
                    const evaluationName = evalForm.querySelector('.evaluation-name').value;
                    const evaluationCoefficient = parseInt(evalForm.querySelector('.evaluation-coefficient').value);
                    const useInterval = evalForm.querySelector('.evaluation-use-interval').checked;
                    
                    let noteMin = null;
                    let noteMax = null;
                    
                    if (useInterval) {
                        noteMin = evalForm.querySelector('.evaluation-note-min').value ? 
                            parseFloat(evalForm.querySelector('.evaluation-note-min').value) : null;
                        noteMax = evalForm.querySelector('.evaluation-note-max').value ? 
                            parseFloat(evalForm.querySelector('.evaluation-note-max').value) : null;
                    } else {
                        const note = evalForm.querySelector('.evaluation-note').value ? 
                            parseFloat(evalForm.querySelector('.evaluation-note').value) : null;
                        noteMin = note;
                        noteMax = note;
                    }
                    
                    if (evaluationName && evaluationCoefficient > 0) {
                        evaluations.push({
                            name: evaluationName,
                            coefficient: evaluationCoefficient,
                            noteMin,
                            noteMax
                        });
                    }
                });
            } else {
                // Mode note globale - créer une évaluation "Total"
                const useInterval = form.querySelector('.global-use-interval').checked;
                let noteMin = null;
                let noteMax = null;
                
                if (useInterval) {
                    noteMin = form.querySelector('.global-note-min').value ? 
                        parseFloat(form.querySelector('.global-note-min').value) : null;
                    noteMax = form.querySelector('.global-note-max').value ? 
                        parseFloat(form.querySelector('.global-note-max').value) : null;
                } else {
                    const note = form.querySelector('.global-note').value ? 
                        parseFloat(form.querySelector('.global-note').value) : null;
                    noteMin = note;
                    noteMax = note;
                }
                
                if (noteMin !== null) {
                    evaluations.push({
                        name: 'Total',
                        coefficient: 1,
                        noteMin,
                        noteMax
                    });
                }
            }
            
            if (subjectName && subjectCoefficient > 0) {
                subjects.push({
                    name: subjectName,
                    coefficient: subjectCoefficient,
                    evaluations
                });
            }
        });
        
        if (editingIndex !== undefined) {
            // Mettre à jour l'UE existante
            elements[editingIndex] = { type: 'ue', name, coefficient, subjects };
            // Supprimer l'index d'édition
            delete document.getElementById('ueName').dataset.editingIndex;
        } else {
            // Ajouter une nouvelle UE
            elements.push({ type: 'ue', name, coefficient, subjects });
        }
        
        setCookie('elements', JSON.stringify(elements), 365);
        updateUI();
        
        // Réinitialisation du formulaire
        document.getElementById('ueName').value = '';
        document.getElementById('ueCoefficient').value = '6';
        document.getElementById('ueSubjects').innerHTML = '';
    }
});

// Gestion du thème
const themeToggle = document.getElementById('themeToggle');
const themeIcon = themeToggle.querySelector('i');

// Vérifier le thème sauvegardé
const savedTheme = localStorage.getItem('theme') || 'light';
document.documentElement.setAttribute('data-theme', savedTheme);
updateThemeIcon(savedTheme);

themeToggle.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
});

function updateThemeIcon(theme) {
    themeIcon.className = theme === 'light' ? 'bi bi-moon-stars' : 'bi bi-sun';
}

// Gestion du partage de données
const shareButton = document.getElementById('shareButton');
const shareModal = new bootstrap.Modal(document.getElementById('shareModal'));
const shareCode = document.getElementById('shareCode');
const copyCode = document.getElementById('copyCode');
const importCode = document.getElementById('importCode');
const importButton = document.getElementById('importButton');

shareButton.addEventListener('click', () => {
    // Générer le code de partage
    const data = {
        elements: elements,
        previousAverage: previousAverage
    };
    const code = btoa(JSON.stringify(data));
    shareCode.textContent = code;
    shareModal.show();
});

copyCode.addEventListener('click', () => {
    navigator.clipboard.writeText(shareCode.textContent).then(() => {
        const originalText = copyCode.innerHTML;
        copyCode.innerHTML = '<i class="bi bi-check-lg me-2"></i>Copié !';
        setTimeout(() => {
            copyCode.innerHTML = originalText;
        }, 2000);
    });
});

importButton.addEventListener('click', () => {
    try {
        const data = JSON.parse(atob(importCode.value));
        if (data.elements && data.previousAverage !== undefined) {
            elements = data.elements;
            previousAverage = data.previousAverage;
            
            // Sauvegarder les données
            setCookie('elements', JSON.stringify(elements), 365);
            setCookie('previousAverage', previousAverage, 365);
            
            // Mettre à jour l'interface
            document.getElementById('previousAverage').value = previousAverage;
            updateUI();
            
            // Fermer la modale
            shareModal.hide();
            
            // Afficher un message de succès
            alert('Données importées avec succès !');
        } else {
            throw new Error('Format de données invalide');
        }
    } catch (error) {
        alert('Erreur lors de l\'importation des données. Veuillez vérifier le code.');
    }
}); 