import { Component, OnInit, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { News } from '../../news';

@Component({
  selector: 'app-news-detail',
  templateUrl: './news-detail.component.html',
  styleUrl: './news-detail.component.css'
})
export class NewsDetailComponent {
  @Input() news: News = {} as News;
  fbSrc: string = '';
  readableDate: any;

  constructor(public newsModalService: NgbActiveModal) {}

  ngOnInit(){
    this.fbSrc = 'https://www.facebook.com/sharer/sharer.php?u=' +
    encodeURIComponent(this.news.url) +
    '&amp;src=sdkpreparse';

    let date = new Date(this.news.datetime * 1000);
    this.readableDate = date.toLocaleDateString('en-GB', {year:'numeric', month: 'long', day: 'numeric'});
    let piece = this.readableDate.split(' ');
    if(piece.length === 3) {
        this.readableDate = `${piece[1]} ${piece[0]}, ${piece[2]}`;
    }
  }

  goToLink(url: string){
    window.open(url, '_blank');
  }
}