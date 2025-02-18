<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import { notes } from './store';
    
    export let showModal: boolean;
    export let noteId: number | null = null;
    
    const dispatch = createEventDispatcher();
    
    let currentNote: any = null;
    let editMode = false;
    let title = '';
    let content = '';
    let color = 'blue';
    let shape: 'square' | 'circle' = 'square';
    let pinned = false;
    let errorMessage = '';
    
    $: if (noteId !== null && $notes) {
        currentNote = $notes.find(n => n.id === noteId);
        if (currentNote) {
            title = currentNote.title;
            content = currentNote.content || '';
            color = currentNote.color;
            shape = currentNote.shape;
            pinned = currentNote.pinned || false;
        }
    }
    
    function toggleEditMode() {
        editMode = !editMode;
        errorMessage = '';
    }
    
    function closeModal() {
        showModal = false;
        dispatch('close');
    }
    
    function saveChanges() {
        if (title.trim() === '') {
            errorMessage = 'Title cannot be empty!';
            return;
        }
        
        if (noteId === null || !currentNote) {
            return;
        }
        
        notes.update(allNotes => 
            allNotes.map(note => 
                note.id === noteId ? 
                { ...note, title, content, color, shape, pinned } : 
                note
            )
        );
        
        editMode = false;
    }
    
    function deleteNote() {
        if (noteId === null) return;
        
        if (confirm('Are you sure you want to delete this note?')) {
            notes.update(allNotes => allNotes.filter(note => note.id !== noteId));
            closeModal();
        }
    }
    
    function togglePin() {
        pinned = !pinned;
        if (!editMode) {
            // If not in edit mode, save pinned state immediately
            notes.update(allNotes => 
                allNotes.map(note => 
                    note.id === noteId ? 
                    { ...note, pinned } : 
                    note
                )
            );
        }
    }
</script>

<style>
    .modal {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        border-radius: 10px;
        box-shadow: 0px 4px 20px rgba(0, 0, 0, 0.3);
        width: 90%;
        max-width: 500px;
        max-height: 80vh;
        overflow-y: auto;
        color: black;
        z-index: 1000;
    }
    
    .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 15px 20px;
        border-bottom: 1px solid #eee;
    }
    
    .modal-title {
        font-size: 20px;
        font-weight: bold;
        margin: 0;
    }
    
    .close-btn {
        background: none;
        border: none;
        font-size: 24px;
        cursor: pointer;
        padding: 5px;
        line-height: 0.8;
        border-radius: 50%;
        width: 30px;
        height: 30px;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    
    .modal-content {
        padding: 20px;
    }
    
    .note-content {
        white-space: pre-wrap;
        line-height: 1.5;
    }
    
    .modal-footer {
        display: flex;
        justify-content: space-between;
        padding: 15px 20px;
        border-top: 1px solid #eee;
    }
    
    .btn {
        padding: 8px 15px;
        border-radius: 5px;
        cursor: pointer;
        border: none;
        font-size: 14px;
        transition: background 0.3s;
    }
    
    .btn-edit {
        background: #3498db;
        color: white;
    }
    
    .btn-save {
        background: #2ecc71;
        color: white;
    }
    
    .btn-delete {
        background: #e74c3c;
        color: white;
    }
    
    .btn-pin {
        background: #f39c12;
        color: white;
    }

    .btn-unpin {
        background: #95a5a6;
        color: white;
    }
    
    .form-group {
        margin-bottom: 15px;
    }
    
    .form-group label {
        display: block;
        margin-bottom: 5px;
        font-weight: bold;
    }
    
    .form-control {
        width: 100%;
        padding: 8px;
        border-radius: 5px;
        border: 1px solid #ddd;
    }
    
    textarea.form-control {
        min-height: 150px;
        resize: vertical;
    }
    
    .error {
        color: #e74c3c;
        font-size: 14px;
        margin-top: 5px;
    }
    
    .note-indicator {
        display: inline-block;
        width: 20px;
        height: 20px;
        border-radius: 3px;
        margin-right: 10px;
        vertical-align: middle;
    }
    
    .checkbox-container {
        display: flex;
        align-items: center;
        margin: 10px 0;
    }

    .checkbox-container input[type="checkbox"] {
        margin-right: 10px;
    }
    
    .modal-title-container {
        display: flex;
        align-items: center;
    }
    
    .pinned-icon {
        margin-left: 10px;
        font-size: 16px;
        color: #f39c12;
    }
</style>

<div class="modal">
    <div class="modal-header">
        <div class="modal-title-container">
            <span 
                class="note-indicator" 
                style="background-color: {color}; border-radius: {shape === 'circle' ? '50%' : '3px'};">
            </span>
            <h2 class="modal-title">{title}</h2>
            {#if pinned}
                <span class="pinned-icon">📌</span>
            {/if}
        </div>
        <button class="close-btn" on:click={closeModal}>&times;</button>
    </div>
    
    <div class="modal-content">
        {#if editMode}
            <div class="form-group">
                <label for="title">Title</label>
                <input 
                    type="text" 
                    id="title" 
                    class="form-control"
                    bind:value={title}
                    on:input={() => errorMessage = ''}
                />
                {#if errorMessage}
                    <p class="error">{errorMessage}</p>
                {/if}
            </div>
            
            <div class="form-group">
                <label for="content">Content</label>
                <textarea 
                    id="content" 
                    class="form-control"
                    bind:value={content}>
                </textarea>
            </div>
            
            <div class="form-group">
                <label for="color">Color</label>
                <select id="color" class="form-control" bind:value={color}>
                    <option value="blue">Blue</option>
                    <option value="yellow">Yellow</option>
                    <option value="red">Red</option>
                    <option value="green">Green</option>
                </select>
            </div>
            
            <div class="form-group">
                <label for="shape">Shape</label>
                <select id="shape" class="form-control" bind:value={shape}>
                    <option value="square">Square</option>
                    <option value="circle">Circle</option>
                </select>
            </div>
            
            <div class="checkbox-container">
                <input type="checkbox" id="pinned-edit" bind:checked={pinned}>
                <label for="pinned-edit">Pin note to top</label>
            </div>
        {:else}
            <p class="note-content">{content || 'No content'}</p>
        {/if}
    </div>
    
    <div class="modal-footer">
        {#if editMode}
            <button class="btn btn-save" on:click={saveChanges}>Save Changes</button>
            <button class="btn btn-delete" on:click={deleteNote}>Delete</button>
        {:else}
            <div>
                <button class="btn btn-edit" on:click={toggleEditMode}>Edit</button>
                <button class="btn {pinned ? 'btn-unpin' : 'btn-pin'}" on:click={togglePin}>
                    {pinned ? 'Unpin' : 'Pin'}
                </button>
            </div>
            <button class="btn btn-delete" on:click={deleteNote}>Delete</button>
        {/if}
    </div>
</div>