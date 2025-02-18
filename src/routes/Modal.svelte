<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import { notes } from './store';
    
    export let showModal: boolean;
    export let noteId: number | null = null;
    
    const dispatch = createEventDispatcher();
    
    let title = '';
    let content = '';
    let color = '#2C3E50'; // Default color
    let shape: 'square' | 'circle' = 'square';
    let pinned = false;
    let errorMessage = '';
    
    function closeModal() {
        showModal = false;
        dispatch('close');
    }
    
    function saveChanges() {
        if (title.trim() === '') {
            errorMessage = 'Title cannot be empty!';
            return;
        }
        
        if (noteId === null) {
            // Create a new note with x and y properties
            const newNote = {
                id: Date.now(), // Generate a unique ID
                title,
                content,
                color,
                shape,
                pinned,
                x: 0, // Default x position
                y: 0  // Default y position
            };
            notes.update(allNotes => [...allNotes, newNote]);
        } else {
            // Update an existing note
            notes.update(allNotes => 
                allNotes.map(note => 
                    note.id === noteId ? 
                    { ...note, title, content, color, shape, pinned } : 
                    note
                )
            );
        }
        
        closeModal(); // Close modal after saving changes
    }
    
    function deleteNote() {
        if (noteId === null) return;
        
        if (confirm('Are you sure you want to delete this note?')) {
            notes.update(allNotes => allNotes.filter(note => note.id !== noteId));
            closeModal(); // Close modal after deleting the note
        }
    }
</script>

<style>
    /* Modal Styling */
    .modal {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: linear-gradient(180deg, #181C2B 0%, #0F131F 100%);
        border-radius: 15px;
        box-shadow: 0px 4px 20px rgba(0, 0, 0, 0.5);
        width: 90%;
        max-width: 500px;
        max-height: 80vh;
        overflow-y: auto;
        color: white;
        z-index: 1000;
        padding: 25px;
        display: flex;
        flex-direction: column;
        transition: transform 0.3s;
    }

    .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
    }

    .modal-title {
        font-size: 20px;
        font-weight: bold;
        margin: 0;
        color: #BEC6E1;
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
        color: white;
        transition: color 0.3s;
    }

    .close-btn:hover {
        color: #FFD700;
    }

    .modal-content {
        flex-grow: 1;
        display: flex;
        flex-direction: column;
    }

    .form-group {
        margin-bottom: 15px;
        display: flex;
        flex-direction: column;
    }

    .form-group label {
        color: #BEC6E1;
        margin-bottom: 5px;
        font-weight: 500;
    }

    .form-control {
        background: #343D4E;
        border: none;
        border-radius: 5px;
        padding: 12px;
        color: white;
        transition: background 0.3s;
    }

    .form-control:focus {
        background: #4C5670;
    }

    textarea.form-control {
        min-height: 150px;
        resize: vertical;
    }

    .error {
        color: #FF2D2D;
        font-size: 14px;
        margin-top: 5px;
        text-align: center;
    }

    .modal-footer {
        margin-top: 20px;
        display: flex;
        justify-content: space-between;
    }

    .btn {
        padding: 12px 20px;
        border-radius: 25px;
        cursor: pointer;
        border: none;
        font-size: 16px;
        transition: all 0.3s;
        background: linear-gradient(45deg, #2C3E50, #1A202C);
        color: white;
    }

    .btn:hover {
        transform: translateY(-2px);
        background: linear-gradient(45deg, #222B38, #1C202A);
    }

    .btn-save {
        background: linear-gradient(45deg, #4CC26D, #27AE60);
    }

    .btn-save:hover {
        background: linear-gradient(45deg, #55D277, #27AE60);
    }

    .btn-delete {
        background: linear-gradient(45deg, #C23D4C, #9D2B3A);
    }
</style>

<div class="modal">
    <div class="modal-header">
        <h2 class="modal-title">{noteId ? 'Edit Note' : 'Create Note'}</h2>
        <button class="close-btn" on:click={closeModal}>&times;</button>
    </div>
    
    <div class="modal-content">
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
                <option value="#2C3E50">Blue</option>
                <option value="#FFD700">Yellow</option>
                <option value="#C0392B">Red</option>
                <option value="#27AE60">Green</option>
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
    </div>
    
    <div class="modal-footer">
        <button class="btn btn-save" on:click={saveChanges}>{noteId ? 'Save Changes' : 'Create Note'}</button>
        {#if noteId}
            <button class="btn btn-delete" on:click={deleteNote}>Delete</button>
        {/if}
    </div>
</div>