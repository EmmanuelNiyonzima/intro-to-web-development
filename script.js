const STORAGE_KEY = 'photo_albums_v1';

function loadAlbums() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function saveAlbums(albums) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(albums));
}

let albums = loadAlbums();

const createAlbumForm = document.getElementById('createAlbumForm');
const albumNameInput = document.getElementById('albumNameInput');
const albumsContainer = document.getElementById('albumsContainer');
const albumTemplate = document.getElementById('albumTemplate');

function renderAlbums() {
  albumsContainer.innerHTML = '';

  if (!albums.length) {
    albumsContainer.innerHTML = '<p>No albums yet. Create one above.</p>';
    return;
  }

  albums.forEach((album) => {
    const node = albumTemplate.content.cloneNode(true);
    const title = node.querySelector('.album-title');
    const deleteButton = node.querySelector('.delete-album');
    const uploadForm = node.querySelector('.upload-form');
    const imageInput = node.querySelector('.image-input');
    const imagesGrid = node.querySelector('.images-grid');
    const status = node.querySelector('.status');

    title.textContent = album.name;

    deleteButton.addEventListener('click', () => {
      const ok = window.confirm(`Delete album "${album.name}" and all images?`);
      if (!ok) return;
      albums = albums.filter((a) => a.id !== album.id);
      saveAlbums(albums);
      renderAlbums();
    });

    uploadForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const files = [...imageInput.files];
      if (!files.length) return;

      status.textContent = 'Uploading...';

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        try {
          const dataUrl = await fileToDataUrl(file);
          const target = albums.find((a) => a.id === album.id);
          if (!target) break;

          target.images.unshift({
            id: crypto.randomUUID(),
            name: file.name,
            url: dataUrl,
            createdAt: Date.now()
          });

          saveAlbums(albums);
          status.textContent = `Uploaded ${i + 1}/${files.length}`;
        } catch {
          status.textContent = `Failed to upload ${file.name}`;
        }
      }

      imageInput.value = '';
      renderAlbums();
    });

    album.images.forEach((image) => {
      const img = document.createElement('img');
      img.src = image.url;
      img.alt = image.name;
      img.loading = 'lazy';
      imagesGrid.appendChild(img);
    });

    albumsContainer.appendChild(node);
  });
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

createAlbumForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const name = albumNameInput.value.trim();
  if (!name) return;

  albums.unshift({ id: crypto.randomUUID(), name, images: [] });
  saveAlbums(albums);
  albumNameInput.value = '';
  renderAlbums();
});

renderAlbums();
