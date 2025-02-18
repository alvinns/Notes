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
    let color = '#2C3E50';
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
        closeModal();
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

<!-- svelte-ignore css_unused_selector -->
<style>
    /* Note Detail Styling */
    .note-detail {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: linear-gradient(180deg, #181C2B 0%, #0F131F 100%);
        border-radius: 20px;
        box-shadow: 0px 5px 30px rgba(0, 0, 0, 0.6);
        width: 90%;
        max-width: 700px;
        max-height: 80vh;
        overflow-y: auto;
        color: white;
        z-index: 1000;
        padding: 30px;
        display: flex;
        flex-direction: column;
        transition: transform 0.3s;
    }

    .detail-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
    }

    .note-title {
        font-size: 22px;
        font-weight: bold;
        color: #BEC6E1;
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
        color: #8C95B3;
        transition: color 0.3s;
    }

    .close-btn:hover {
        color: #FFD700;
    }

    .detail-content {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 20px;
    }

    .note-preview {
        padding: 20px;
        background: linear-gradient(to right, #34415E 0%, #26345B 100%);
        border-radius: 15px;
        box-shadow: inset 0 3px 10px rgba(0, 0, 0, 0.3);
        overflow: hidden;
        margin-bottom: 20px;
    }

    .note-preview p {
        color: white;
        line-height: 1.6;
        hyphens: auto;
    }

    .editor-controls {
        display: grid;
        grid-template-columns: 1fr;
        gap: 20px;
        margin-top: 20px;
    }

    .editor-group {
        display: flex;
        align-items: center;
        gap: 10px;
    }

    .editor-label {
        color: #BEC6E1;
        font-size: 14px;
        font-weight: 500;
        width: 120px;
    }

    .editor-input {
        background: #343D4E;
        border: none;
        border-radius: 7px;
        padding: 12px;
        color: white;
        flex: 1;
        font-family: 'Fira Sans', sans-serif;
        transition: background 0.3s;
    }

    .editor-input:focus {
        background: #4C5670;
    }

    .editor-color {
        width: 35px;
        height: 35px;
        border-radius: 50%;
        cursor: pointer;
        transition: transform 0.3s;
    }

    .editor-color:hover {
        transform: scale(1.1);
    }

    .detail-actions {
        display: flex;
        justify-content: space-between;
        margin-top: 30px;
    }

    .action-btn {
        padding: 12px 25px;
        border-radius: 25px;
        cursor: pointer;
        border: none;
        font-size: 16px;
        transition: all 0.3s;
        background: linear-gradient(45deg, #2C3E50, #1A202C);
        color: white;
    }

    .action-btn:hover {
        transform: translateY(-2px);
        background: linear-gradient(45deg, #222B38, #1C202A);
    }

    .action-btn.primary {
        background: linear-gradient(45deg, #4CC26D, #27AE60);
    }

    .action-btn.primary:hover {
        background: linear-gradient(45deg, #55D277, #27AE60);
    }

    .pinned-indicator {
        display: flex;
        align-items: center;
        gap: 5px;
        color: #FFD700;
        font-size: 14px;
        margin-top: 10px;
    }
</style>

<div class="note-detail">
    <div class="detail-header">
        <div class="note-info">
            <h2 class="note-title">{title}</h2>
        </div>
        <button class="close-btn" on:click={closeModal}>&times;</button>
    </div>
    
    <div class="detail-content">
        {#if editMode}
            <div class="editor-group">
                <span class="editor-label">Title:</span>
                <input 
                    type="text" 
                    class="editor-input"
                    bind:value={title}
                    required
                />
            </div>

            <div class="editor-group">
                <span class="editor-label">Content:</span>
                <textarea 
                    rows="10" 
                    class="editor-input"
                    bind:value={content}>
                </textarea>
            </div>

            <div class="editor-group">
                <span class="editor-label">Color:</span>
                <div class="editor-color" style="background: {color};"></div>
                <select class="editor-input" bind:value={color}>
                    <option value="#2C3E50">Blue</option>
                    <option value="#FFD700">Yellow</option>
                    <option value="#C0392B">Red</option>
                    <option value="#27AE60">Green</option>
                </select>
            </div>

            <div class="editor-group">
                <span class="editor-label">Shape:</span>
                <div class="editor-color" style="border-radius: {shape === 'circle' ? '50%' : '3px'};"></div>
                <select class="editor-input" bind:value={shape}>
                    <option value="square">Square</option>
                    <option value="circle">Circle</option>
                </select>
            </div>

            <div class="editor-group">
                <span class="editor-label">Pinned:</span>
                <label class="toggle-switch">
                    <input type="checkbox" bind:checked={pinned}>
                    <span class="slider"></span>
                </label>
            </div>
        {:else}
            <div class="note-preview">
                <p>{content || 'No content'}</p>
            </div>
            <div class="pinned-indicator">
                {#if pinned}
                    <span>📌 Pinned to top</span>
                {:else}
                    <span>Unpinned</span>
                {/if}
            </div>
        {/if}
    </div>
    
    <div class="detail-actions">
        {#if editMode}
            <button class="action-btn primary" on:click={saveChanges}>Save Changes</button>
            <button class="action-btn danger" on:click={deleteNote}>Delete</button>
        {:else}
            <button class="action-btn primary" on:click={toggleEditMode}>Edit</button>
            <button class="action-btn" on:click={togglePin}>
                { pinned ? 'Unpin' : 'Pin' }
            </button>
            <button class="action-btn danger" on:click={deleteNote}>Delete</button>
        {/if}
    </div>
</div>