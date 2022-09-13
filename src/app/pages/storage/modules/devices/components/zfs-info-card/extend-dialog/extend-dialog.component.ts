import {
  ChangeDetectionStrategy, Component, Inject, OnInit,
} from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { TranslateService } from '@ngx-translate/core';
import filesize from 'filesize';
import { Observable, of } from 'rxjs';
import { JobState } from 'app/enums/job-state.enum';
import helptext from 'app/helptext/storage/volumes/volume-status';
import { Option } from 'app/interfaces/option.interface';
import { PoolAttachParams } from 'app/interfaces/pool.interface';
import { UnusedDisk } from 'app/interfaces/storage.interface';
import { SnackbarService } from 'app/modules/snackbar/services/snackbar.service';
import { AppLoaderService, DialogService, WebSocketService } from 'app/services';

export interface ExtendDialogParams {
  poolId: number;
  targetVdevGuid: string;
}

@UntilDestroy()
@Component({
  templateUrl: './extend-dialog.component.html',
  styleUrls: ['./extend-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExtendDialogComponent implements OnInit {
  newDiskControl = new FormControl(null as string, Validators.required);
  unusedDiskOptions$: Observable<Option[]>;
  unusedDisks: UnusedDisk[] = [];

  readonly helptext = helptext;

  private disksWithDuplicateSerials: UnusedDisk[] = [];

  constructor(
    private ws: WebSocketService,
    private loader: AppLoaderService,
    private snackbar: SnackbarService,
    private translate: TranslateService,
    private dialogService: DialogService,
    private dialogRef: MatDialogRef<ExtendDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ExtendDialogParams,
  ) { }

  ngOnInit(): void {
    this.loadUnusedDisks();
    this.setupWarningForUnusedDisksWithExportedPoolsAttached();
  }

  setupWarningForUnusedDisksWithExportedPoolsAttached(): void {
    this.newDiskControl.valueChanges.pipe(untilDestroyed(this)).subscribe(this.warnAboutExportedZpoolForDiskIfRequired);
  }

  warnAboutExportedZpoolForDiskIfRequired = (diskName: string): void => {
    const disk = this.findDisk(diskName);
    if (disk.exported_zpool) {
      this.showWarningAboutExportedZpoolForDisk(disk);
    }
  };

  findDisk(diskName: string): UnusedDisk {
    return this.unusedDisks.find((unusedDisk) => unusedDisk.name === diskName);
  }

  showWarningAboutExportedZpoolForDisk(unusedDisk: UnusedDisk): void {
    this.dialogService.warn(
      this.translate.instant('Warning'),
      this.translate.instant(helptext.exported_zpool_warning, { zpool: '\'' + unusedDisk.exported_zpool + '\'' }),
    );
  }

  onSubmit(event: SubmitEvent): void {
    event.preventDefault();
    this.loader.open();

    const payload = {
      new_disk: this.newDiskControl.value,
      target_vdev: this.data.targetVdevGuid,
    } as PoolAttachParams;

    const isDuplicateSerial = this.disksWithDuplicateSerials.some((disk) => disk.name === payload.new_disk);
    if (isDuplicateSerial) {
      payload.allow_duplicate_serials = true;
    }

    this.ws.job('pool.attach', [this.data.poolId, payload])
      .pipe(untilDestroyed(this))
      .subscribe(
        (job) => {
          if (job.state !== JobState.Success) {
            return;
          }

          this.loader.close();
          this.snackbar.success(this.translate.instant('Vdev successfully extended.'));
          this.dialogRef.close(true);
        },
        (error) => {
          this.loader.close();
          this.dialogService.errorReportMiddleware(error);
        },
      );
  }

  private loadUnusedDisks(): void {
    this.ws.call('disk.get_unused')
      .pipe(untilDestroyed(this))
      .subscribe((disks) => {
        this.unusedDisks = disks;
        this.unusedDiskOptions$ = of(
          disks.map((disk) => ({
            label: (
              disk.devname + ' (' + filesize(disk.size, { standard: 'iec' }) + ')'
              + (disk.exported_zpool ? ' (' + disk.exported_zpool + ')' : '')
            ),
            value: disk.name,
          })),
        );

        this.disksWithDuplicateSerials = disks.filter((disk) => disk.duplicate_serial.length);
      }, (error) => {
        this.dialogService.errorReportMiddleware(error);
      });
  }
}