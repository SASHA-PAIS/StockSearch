import { Component, OnInit } from '@angular/core';
import { StateService } from '../../state.service';
import { News } from '../../news';
import { NewsDetailComponent } from '../news-detail/news-detail.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-news',
  templateUrl: './news.component.html',
  styleUrl: './news.component.css'
})
export class NewsComponent implements OnInit{
  allNews: News[] = [];

  constructor(
    private state: StateService,
    private newsModalService: NgbModal
  ) {}

  ngOnInit(): void {
    this.state.getNews().subscribe((allNews) => {
      const firstTwenty = [];

      for (let article of allNews){
          if (article.image && article.image.trim() !== "" &&
              article.url && article.url.trim() !== "" &&
              article.datetime && typeof article.datetime === 'number' && article.datetime > 0 &&
              article.headline && article.headline.trim() !=="" &&
              article.source && article.source.trim() != "" &&
              article.summary && article.summary.trim() != ""){
                firstTwenty.push(article);
          }
          if(firstTwenty.length === 20){
              break;
          }
      }
      this.allNews = firstTwenty;
    });
  }

  openNewsDetail(news: News){
    const newsModalRef = this.newsModalService.open(NewsDetailComponent);
    newsModalRef.componentInstance.news = news;
  }
}