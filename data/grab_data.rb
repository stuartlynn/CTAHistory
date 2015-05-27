require 'nokogiri'
require 'open-uri'
require 'pry'

doc = Nokogiri::HTML(open("http://en.wikipedia.org/wiki/List_of_Chicago_%22L%22_stations"))

table =  doc.css("table").select{|a| a.to_s.include?("Rapid transit stations on the Chicago")}.first
rows  = table.css("tr")
data = rows[1..-1].collect do |row|
    colls          = row.css("td")

    station        = row.css("th").first.css("a")[0].inner_html

    lines          = colls[0].css("a").first.inner_html
    location       = colls[2].css("a").first.inner_html
    opened         = colls[3].css("span").first.inner_html
    structure      = colls[4].inner_html

    [station,  lines, location, opened,  structure].join(", ")
end

File.open("cta_stops.csv", "w"){|f| f.puts data.join("\n")}

doc = Nokogiri::HTML(open("http://en.wikipedia.org/wiki/List_of_former_Chicago_%22L%22_stations"))
table =  doc.css("table").select{|a| a.to_s.include?("Status")}.first
rows = table.css("tr")

data = rows[1..-1].collect do |row|
  colls          = row.css("td,th")
  begin
  station        = colls[0].css("a").first.inner_html
  branch         = colls[1].css("a").first.inner_html
  location       = colls[2].css("a").first.inner_html

  if  colls[3].to_s.include? "circa"
    opened         = colls[3].inner_html
  else
    opened         = colls[3].css("span").first.inner_html
  end

  closed         = colls[4].css("span").first.inner_html
  status         = colls[5].inner_html
  rescue
    binding.pry
  end
  [station, branch, location, opened, closed, status].join(", ")
end

File.open("destroyed_cta_stops.csv", "w"){|f| f.puts data.join("\n")}
