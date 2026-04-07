import requests
from bs4 import BeautifulSoup

def scrape_job_details(url: str):
    headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"}
    try:
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()
        soup = BeautifulSoup(response.text, 'html.parser')

        # Extract Title
        title_tag = soup.find('h1')
        role = title_tag.get_text().strip() if title_tag else "Unknown Role"

        # Extract Company
        company_tag = soup.find('div', class_='topcard__flavor') or soup.find('a', class_='topcard__org-name-link')
        company = company_tag.get_text().strip() if company_tag else "Unknown Company"

        # Extract Description (The fix for the URL issue)
        description = ""
        selectors = [{'name': 'div', 'class': 'description__text'}, {'name': 'div', 'id': 'jobDescriptionText'}]
        for s in selectors:
            content = soup.find(s['name'], class_=s.get('class'), id=s.get('id'))
            if content:
                description = content.get_text(separator="\n").strip()
                break

        return {"company_name": company, "role": role, "job_description": description}
    except Exception as e:
        print(f"Error: {e}")
        return None