import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-image-dialog',
  imports: [],
  templateUrl: './image-dialog.component.html',
  styleUrl: './image-dialog.component.css'
})
export class ImageDialogComponent {
  dialogeRef = inject(MatDialogRef<ImageDialogComponent>);
  dialogeData = inject(MAT_DIALOG_DATA) as { imageUrl?: string };
  imageNotLoading = false;

  closeDialogue(): void {
    this.dialogeRef.close();
  }
}
